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
// Body: { email, name?, isRegister: bool }
app.post('/api/auth/request-otp', async (req, res) => {
  const { email, name, isRegister } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    if (isRegister) {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'This email is already registered. Please log in instead.' });
      }

      // Create user record first
      const { error: userErr } = await supabaseAdmin.from('users').insert({
        name: name?.trim(),
        email: email.toLowerCase().trim(),
        total_xp: 0,
      });

      if (userErr && userErr.code !== '23505') { // ignore unique violation from race condition
        console.error('User insert error:', userErr);
        return res.status(400).json({ error: userErr.message });
      }
    }

    // Send OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: undefined, // no redirect needed for OTP-only
      },
    });

    if (error) {
      console.error('OTP send error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'OTP sent successfully', email });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/verify-otp
// Body: { email, token }
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'Email and token are required' });

  try {
    // Verify the OTP token with Supabase
    const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token,
      type: 'email',
    });

    if (verifyErr) {
      console.error('OTP verify error:', verifyErr);
      return res.status(400).json({ error: 'Invalid or expired code. Please try again.' });
    }

    // Get user from our DB
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, total_xp')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    // Generate our own JWT session token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        total_xp: user.total_xp,
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, total_xp, created_at')
      .eq('id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Case Studies Routes ────────────────────────────────────────

// GET /api/case-studies — list all case studies
app.get('/api/case-studies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('id, title, core_idea')
      .order('id');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/case-studies/:id — full case study with stages
app.get('/api/case-studies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: cs } = await supabase
      .from('case_studies')
      .select('id, title, core_idea, story_intro, real_world')
      .eq('id', id)
      .single();

    if (!cs) return res.status(404).json({ error: 'Case study not found' });

    const { data: stages } = await supabase
      .from('stages')
      .select('id, stage_number, concept_label')
      .eq('case_study_id', id)
      .order('stage_number');

    res.json({ ...cs, stages: stages || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/case-studies/:id/stages/:stageNumber — questions for a stage
app.get('/api/case-studies/:id/stages/:stageNumber', async (req, res) => {
  const { id, stageNumber } = req.params;
  try {
    // Get stage
    const { data: stage } = await supabase
      .from('stages')
      .select('id, stage_number, concept_label')
      .eq('case_study_id', id)
      .eq('stage_number', stageNumber)
      .single();

    if (!stage) return res.status(404).json({ error: 'Stage not found' });

    // Pick one random variant per position (1,2,3) for this session
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question_text, answer_type, position')
      .eq('stage_id', stage.id)
      .order('position');

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this stage' });
    }

    // Group by position and pick a random variant
    const byPosition = {};
    for (const q of questions) {
      if (!byPosition[q.position]) byPosition[q.position] = [];
      byPosition[q.position].push(q);
    }

    const selected = Object.values(byPosition).map((qs) =>
      qs[Math.floor(Math.random() * qs.length)]
    );

    // Return question IDs — client fetches full question text per session
    // For now return all question text (hide answer until submitted)
    res.json({ stage, questions: selected.map(q => ({ ...q, _answer: undefined })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/questions/:id/answer — check answer
app.post('/api/questions/:id/answer', authenticate, async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  try {
    const { data: q } = await supabase
      .from('questions')
      .select('id, answer, answer_type')
      .eq('id', id)
      .single();

    if (!q) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = q.answer_type === 'integer'
      ? Number(answer) === Number(q.answer)
      : String(answer).trim().toLowerCase() === String(q.answer).trim().toLowerCase();

    res.json({ isCorrect, correctAnswer: q.answer });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Progress Routes ────────────────────────────────────────────

// GET /api/progress — get all progress for authenticated user
app.get('/api/progress', authenticate, async (req, res) => {
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('case_study_id, current_stage, status, xp_earned, last_updated')
      .eq('user_id', req.userId);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/progress — save/update progress
app.post('/api/progress', authenticate, async (req, res) => {
  const { case_study_id, current_stage, status, xp_earned } = req.body;
  if (!case_study_id) return res.status(400).json({ error: 'case_study_id required' });

  try {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id, xp_earned')
      .eq('user_id', req.userId)
      .eq('case_study_id', case_study_id)
      .single();

    if (existing) {
      const xpDelta = Math.max(0, (xp_earned || 0) - (existing.xp_earned || 0));
      await supabase
        .from('user_progress')
        .update({ current_stage, status, xp_earned, last_updated: new Date().toISOString() })
        .eq('id', existing.id);

      if (xpDelta > 0) {
        await supabase.rpc('increment_total_xp', { x_user_id: req.userId, x_delta: xpDelta });
      }
    } else {
      await supabase.from('user_progress').insert({
        user_id: req.userId,
        case_study_id,
        current_stage,
        status,
        xp_earned,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/attempts — log a question attempt
app.post('/api/attempts', authenticate, async (req, res) => {
  const { question_id, answer_given, is_correct, attempt_number } = req.body;
  try {
    await supabase.from('user_attempts').insert({
      user_id: req.userId,
      question_id,
      answer_given,
      is_correct,
      attempt_number: attempt_number || 1,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Tenali server running on port ${PORT}`));