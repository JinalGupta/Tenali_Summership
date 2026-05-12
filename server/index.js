require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ── Supabase Clients ───────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── JWT Middleware ────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── Auth Routes ───────────────────────────────────────────────

// POST /api/auth/request-otp
app.post('/api/auth/request-otp', async (req, res) => {
  const { email, name, isRegister } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    if (isRegister) {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      if (existing) {
        return res.status(400).json({ error: 'Email already registered. Please log in.' });
      }
      // Create auth user via admin client
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name }
      });
      if (authErr) return res.status(400).json({ error: authErr.message });

      // Create user record
      const { error: userErr } = await supabaseAdmin.from('users').insert({
        id: authUser.user.id,
        name,
        email
      });
      if (userErr) return res.status(400).json({ error: userErr.message });
    }

    // Send OTP via Supabase
    const { error: otpErr } = await supabaseAdmin.auth.admin.generateOidcProviderToken(
      email,
      'email'
    );

    // Use the standard OTP flow
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'http://localhost:5173' }
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'OTP sent to email', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'Email and token are required' });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'email',
      email,
      password: token
    });

    // Verify with the token
    const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (verifyErr) return res.status(400).json({ error: verifyErr.message });

    // Get user from DB
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, total_xp')
      .eq('email', email)
      .single();

    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, total_xp: user.total_xp }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, total_xp')
    .eq('id', req.userId)
    .single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ── Case Studies Routes ────────────────────────────────────────

// GET /api/case-studies
app.get('/api/case-studies', async (req, res) => {
  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('id, title, core_idea');
  res.json(caseStudies || []);
});

// GET /api/case-studies/:id
app.get('/api/case-studies/:id', async (req, res) => {
  const { id } = req.params;
  const { data: cs } = await supabase
    .from('case_studies')
    .select('id, title, core_idea, story_intro, real_world')
    .eq('id', id)
    .single();

  const { data: stages } = await supabase
    .from('stages')
    .select('id, stage_number, concept_label')
    .eq('case_study_id', id)
    .order('stage_number');

  res.json({ ...cs, stages: stages || [] });
});

// GET /api/case-studies/:id/stages/:stageNumber
app.get('/api/case-studies/:id/stages/:stageNumber', async (req, res) => {
  const { id, stageNumber } = req.params;

  const { data: stage } = await supabase
    .from('stages')
    .select('id, stage_number, concept_label')
    .eq('case_study_id', id)
    .eq('stage_number', stageNumber)
    .single();

  if (!stage) return res.status(404).json({ error: 'Stage not found' });

  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, answer_type, position')
    .eq('stage_id', stage.id)
    .order('position');

  res.json({ stage, questions: questions || [] });
});

// ── Progress Routes ────────────────────────────────────────────

// GET /api/progress/:userId
app.get('/api/progress/:userId', authenticate, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { data: progress } = await supabase
    .from('user_progress')
    .select('case_study_id, current_stage, status, xp_earned')
    .eq('user_id', req.userId);
  res.json(progress || []);
});

// POST /api/progress
app.post('/api/progress', authenticate, async (req, res) => {
  const { case_study_id, current_stage, status, xp_earned } = req.body;
  if (!case_study_id) return res.status(400).json({ error: 'case_study_id required' });

  const { data: existing } = await supabase
    .from('user_progress')
    .select('id, xp_earned')
    .eq('user_id', req.userId)
    .eq('case_study_id', case_study_id)
    .single();

  const xpDelta = existing ? xp_earned - (existing.xp_earned || 0) : xp_earned;

  if (existing) {
    await supabase
      .from('user_progress')
      .update({ current_stage, status, xp_earned, last_updated: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('user_progress')
      .insert({ user_id: req.userId, case_study_id, current_stage, status, xp_earned });
  }

  // Update total XP
  if (xpDelta > 0) {
    await supabase.rpc('increment_total_xp', { user_id: req.userId, delta: xpDelta });
  }

  res.json({ success: true });
});

// POST /api/attempts
app.post('/api/attempts', authenticate, async (req, res) => {
  const { question_id, answer_given, is_correct, attempt_number } = req.body;
  await supabase.from('user_attempts').insert({
    user_id: req.userId,
    question_id,
    answer_given,
    is_correct,
    attempt_number: attempt_number || 1
  });
  res.json({ success: true });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Tenali server running on port ${PORT}`));