# Tenali — SPEC.md

## 1. Concept & Vision

Tenali is an interactive, story-driven web application that teaches foundational computing and mathematical theorems through adaptive, question-based learning. Named after Tenali Rama — the legendary wit who solved problems through clever, incremental thinking — it scaffolds complex ideas from first principles using only single-word or integer-answer questions.

**Tone:** Warm, intelligent, curious — like a brilliant tutor, not a cold textbook.

---

## 2. Design Language

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary (Navy) | Deep navy | `#0F2D5A` |
| Accent (Teal) | Electric teal | `#009B83` |
| Warning (Amber) | Warm amber | `#F5A623` |
| Danger (Coral) | Muted coral | `#E84D3A` |
| Background | Soft cream | `#F0F4F8` |
| Text Primary | Dark navy | `#0F2D5A` |
| Text Muted | Mid gray | `#6B7280` |
| Success | Teal | `#009B83` |
| White | Pure white | `#FFFFFF` |

### Typography
- **Display:** Playfair Display (or Georgia fallback) — theorem names, case study titles
- **Body:** Inter (or system sans-serif) — questions, UI text
- **Mono:** JetBrains Mono (or monospace) — numerical answers

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 12px (cards), 8px (inputs), 24px (buttons)

### Motion Philosophy
- Slide transitions between questions: `x: 50 → 0`, 300ms ease-out
- Correct answer: border glow green + XP counter tick animation
- Wrong answer: gentle horizontal shake (3 oscillations, 300ms)
- Hint: slides up from below, 250ms
- Stage completion: progress bar fills smoothly, 500ms

---

## 3. Layout & Structure

### Pages
1. **Landing** — Full-screen centered login/register toggle
2. **OTP Verification** — Single focused 6-digit input, auto-advance between digits
3. **Dashboard** — Full-screen responsive grid of 7 case study cards
4. **Learning Engine** — Story intro → Stage sequence → Payoff reveal

### Header (Dashboard + Learning)
- Tenali logo (left)
- User name + avatar circle (right)
- Logout button

### Responsive Strategy
- Mobile-first, min 360px
- Desktop: 7-card grid in 3-2-2-1 or 4-3 layout
- Tablet: 2-column grid
- Mobile: 1-column stack

---

## 4. Features & Interactions

### Authentication (OTP-based)
- Register: Full Name + Email → OTP sent → 6-digit verification → Account created
- Login: Email → OTP sent → verified → redirected to Dashboard
- OTP expires in 10 minutes
- Max 3 resend attempts per session
- 30-second cooldown on resend button
- Email uniqueness enforced; registered emails redirect to Login

### Dashboard
- 7 case study cards in responsive grid
- Each card shows: SVG illustration, theorem name, one-line core idea, progress bar ("Step 3/6"), status badge
- Status badges: `Not Started` (gray), `In Progress` (amber), `Mastered` (teal)
- Click card → navigates to Learning Engine (or resumes if in progress)
- Total XP displayed prominently

### Learning Engine Flow
1. **Story Intro** — Illustrated scrollable story card; "Begin" button starts questions
2. **Stage** — Concept label + 3 questions shown one at a time
3. **Question** — Single input (text or integer), Enter to submit, auto-focused
4. **Correct (1st attempt)** — +10 XP, green glow, advance to next question
5. **Wrong (1st attempt)** — Hint shown below input, retry
6. **Correct (2nd attempt)** — +5 XP, continue
7. **Wrong (2nd attempt)** — Regress to previous stage (or Stage 1 if at start)
8. **Stage Complete** — +20 XP bonus, brief celebration, next stage loads
9. **Payoff Screen** — After final stage: theorem statement + plain-English explanation + 3 real-world applications + badge

### Input Rules
- One word (text) OR one integer only
- Trim whitespace, lowercase comparison for text
- Integer inputs: digits only
- Enter key submits
- Auto-focus on question load

### Progress Persistence
- Progress saved to Supabase after each stage completion
- User can resume from saved stage on return

---

## 5. Component Inventory

### `CaseStudyCard`
- Themed SVG illustration (unique per case study)
- Title: Playfair Display, bold
- Subtitle: core idea in muted text
- Progress: "Step X / Y" with animated fill bar
- Status badge: colored pill
- States: default, hover (lift shadow), in-progress (amber border), mastered (teal border)

### `QuestionInput`
- Large centered input field
- Border: default gray → focus teal → correct green glow → wrong coral shake
- Submit on Enter
- Integer mode: numeric keyboard on mobile

### `HintBox`
- Slides up from below on wrong answer
- Amber background, italic text
- "Hint:" prefix in bold

### `PayoffScreen`
- Full-screen dramatic reveal
- Theorem name in large serif
- Formal notation in display math style
- Plain-English summary linking back to each stage
- 3 real-world application cards
- "Mastered" badge with animation
- Buttons: "Back to Dashboard" / "Replay"

### `ProgressBar`
- Thin animated bar
- Fills smoothly on stage completion
- Teal color

### `OTPInput`
- 6 individual boxes, auto-advance on digit entry
- Backspace navigates to previous box
- Paste support for full OTP

### `Header`
- Logo + nav
- User avatar (initials circle) + name
- Logout button (text, no icon)

---

## 6. Technical Approach

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Zustand** for state management
- **Framer Motion** for animations
- **Axios** for API calls
- **@supabase/supabase-js** for auth + DB

### Backend
- **Node.js + Express** (standalone server on port 3001)
- **@supabase/supabase-js** server-side client
- **jsonwebtoken** for JWT session management
- **cors** for cross-origin
- **dotenv** for env vars

### Database (Supabase/PostgreSQL)
See Section 7 for full schema.

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, return JWT |
| GET | `/api/case-studies` | List all 7 case studies |
| GET | `/api/case-studies/:id/stages/:stageNumber` | Get questions for a stage |
| POST | `/api/progress` | Save/update user progress |
| GET | `/api/progress/:userId` | Get all progress for a user |
| POST | `/api/attempts` | Log a question attempt |

### Auth Flow
1. Client calls `/api/auth/request-otp` with email
2. Server uses Supabase Auth Admin API to send OTP
3. Client collects 6-digit OTP, calls `/api/auth/verify-otp`
4. Server verifies with Supabase, generates JWT, returns to client
5. Client stores JWT, includes in Authorization header for all subsequent requests

---

## 7. Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  core_idea TEXT NOT NULL,
  story_intro TEXT NOT NULL,
  real_world TEXT[] NOT NULL
);

CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id INTEGER REFERENCES case_studies(id),
  stage_number INTEGER NOT NULL,
  concept_label VARCHAR(255) NOT NULL
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES stages(id),
  question_text TEXT NOT NULL,
  answer VARCHAR(255) NOT NULL,
  hint TEXT NOT NULL,
  answer_type VARCHAR(20) NOT NULL CHECK (answer_type IN ('text', 'integer')),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3)
);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  case_study_id INTEGER REFERENCES case_studies(id),
  current_stage INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  xp_earned INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, case_study_id)
);

CREATE TABLE user_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES questions(id),
  answer_given VARCHAR(255),
  is_correct BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Case Study Data Summary

All 7 case studies with their stages and questions are defined in the requirements doc. Full seed data is in `server/seed.sql`.

| # | Title | Stages | Questions |
|---|-------|--------|-----------|
| 1 | Fermat's Little Theorem | 7 | 21 |
| 2 | Handshake Problem | 6 | 18 |
| 3 | Chinese Remainder Theorem | 6 | 18 |
| 4 | Coupon Collector Problem | 6 | 18 |
| 5 | Euclidean Algorithm | 6 | 18 |
| 6 | Modular Multiplicative Inverse | 6 | 18 |
| 7 | Fast Large Powers (Binary Exponentiation) | 6 | 18 |

**Total: 7 case studies, 43 stages, 129 questions**

---

## 9. Adaptive Logic

```
on question submit:
  if answer matches (case-insensitive for text, exact for integer):
    award XP (10 if first attempt, 5 if retry)
    if all 3 questions in stage correct:
      award stage bonus (+20 XP)
      advance to next stage
    else:
      advance to next question in stage
  else:
    if attempt_number == 1:
      show hint
      allow retry
    else:
      regress to previous_stage (current_stage - 1, min 1)
      reset current stage question index to 1
```

---

## 10. XP System

| Event | XP |
|-------|-----|
| Correct (first attempt) | +10 |
| Correct (after hint/retry) | +5 |
| Stage completed | +20 |
| Case study mastered | +100 |

---

*Last updated: 2026-05-12*