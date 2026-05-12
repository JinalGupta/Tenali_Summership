import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API = 'http://localhost:3001/api'

export default function LearningPage() {
  const { caseStudyId } = useParams()
  const navigate = useNavigate()
  const { token, user, fetchMe } = useAuthStore()

  const [caseStudy, setCaseStudy] = useState(null)
  const [currentStage, setCurrentStage] = useState(1)
  const [questionIdx, setQuestionIdx] = useState(0)   // 0,1,2 within stage
  const [questions, setQuestions] = useState([])
  const [answer, setAnswer] = useState('')
  const [hint, setHint] = useState('')
  const [wrong, setWrong] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [attempt, setAttempt] = useState(1)
  const [stageXp, setStageXp] = useState(0)
  const [phase, setPhase] = useState('story')         // 'story' | 'questions' | 'payoff'
  const [loading, setLoading] = useState(true)
  const [totalStages, setTotalStages] = useState(0)

  useEffect(() => { fetchMe() }, [])
  useEffect(() => { if (!token) navigate('/login') }, [token])

  // Load case study metadata
  useEffect(() => {
    if (!token || !caseStudyId) return
    axios.get(`${API}/case-studies/${caseStudyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => {
      setCaseStudy(data)
      setTotalStages(data.stages?.length || 1)
      setLoading(false)
    }).catch(() => navigate('/dashboard'))
  }, [token, caseStudyId])

  // Load first stage questions when entering questions phase
  useEffect(() => {
    if (phase !== 'questions' || !token) return
    loadStage(currentStage)
  }, [phase])

  const loadStage = (stageNum) => {
    setLoading(true)
    setQuestionIdx(0)
    setAnswer('')
    setHint('')
    setWrong(false)
    setCorrect(false)
    setAttempt(1)
    axios.get(`${API}/case-studies/${caseStudyId}/stages/${stageNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => {
      setQuestions(data.questions)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return
    const q = questions[questionIdx]
    const { data } = await axios.post(
      `${API}/questions/${q.id}/answer`,
      { answer: answer.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (data.isCorrect) {
      setCorrect(true)
      setWrong(false)
      await axios.post(`${API}/attempts`, {
        question_id: q.id, answer_given: answer, is_correct: true, attempt_number: attempt
      }, { headers: { Authorization: `Bearer ${token}` } })
      setTimeout(() => {
        setCorrect(false)
        setAnswer('')
        if (questionIdx < 2) {
          // Next question
          setQuestionIdx(questionIdx + 1)
          setAttempt(1)
        } else {
          // Stage complete!
          const newXp = stageXp + 20
          setStageXp(newXp)
          if (currentStage >= totalStages) {
            // Mastered!
            saveProgress(totalStages, 'mastered', newXp + 100)
            setPhase('payoff')
          } else {
            saveProgress(currentStage + 1, 'in_progress', newXp)
            setCurrentStage(currentStage + 1)
            setQuestionIdx(0)
            setAttempt(1)
          }
        }
      }, 800)
    } else {
      await axios.post(`${API}/attempts`, {
        question_id: q.id, answer_given: answer, is_correct: false, attempt_number: attempt
      }, { headers: { Authorization: `Bearer ${token}` } })
      if (attempt === 1) {
        setWrong(true)
        setAttempt(2)
        // Show hint placeholder — in v0.4 we'll fetch from DB
        setHint('Think about this step by step…')
        setTimeout(() => setWrong(false), 600)
      } else {
        // Regress
        setWrong(true)
        setTimeout(() => {
          setWrong(false)
          setAnswer('')
          if (currentStage > 1) {
            setCurrentStage(currentStage - 1)
            loadStage(currentStage - 1)
          } else {
            loadStage(1)
          }
          setAttempt(1)
          setQuestionIdx(0)
        }, 1000)
      }
    }
  }

  const saveProgress = (stage, status, xp) => {
    axios.post(`${API}/progress`, {
      case_study_id: Number(caseStudyId), current_stage: stage, status, xp_earned: xp
    }, { headers: { Authorization: `Bearer ${token}` } })
  }

  if (!token || loading && !caseStudy) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading…</div>
      </div>
    )
  }

  const q = questions[questionIdx]

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <button onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-white text-sm transition-colors">
          ← Dashboard
        </button>
        <div className="text-center">
          <h2 className="font-display text-white text-lg">{caseStudy?.title}</h2>
          {phase === 'questions' && (
            <p className="text-white/40 text-xs">Stage {currentStage} of {totalStages} · +{stageXp} XP</p>
          )}
        </div>
        <div className="w-16" />
      </header>

      <AnimatePresence mode="wait">
        {phase === 'story' && caseStudy && (
          <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-teal/20 text-teal text-xs font-semibold rounded-full mb-6">
                CASE STUDY {caseStudy.id}
              </span>
              <h1 className="font-display text-4xl text-white font-bold mb-6">{caseStudy.title}</h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 italic">"{caseStudy.story_intro}"</p>
              <button onClick={() => setPhase('questions')}
                className="btn-primary text-lg px-10 py-4">
                Begin Learning
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'questions' && (
          <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="w-full max-w-lg">
              {/* Stage label */}
              <div className="text-center mb-8">
                <p className="text-white/40 text-sm mb-1">Stage {currentStage} of {totalStages}</p>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-teal transition-all"
                    style={{ width: `${((currentStage - 1) * 3 + questionIdx + 1) / (totalStages * 3) * 100}%` }} />
                </div>
              </div>

              {/* Question card */}
              <div className={`bg-white/5 border rounded-card p-8 mb-6 transition-all ${wrong ? 'border-coral animate-[shake_0.4s]' : correct ? 'border-teal' : 'border-white/10'}`}>
                <p className="text-white/50 text-xs mb-4 font-mono">Question {questionIdx + 1} of 3</p>
                <h3 className="text-white text-xl font-body font-medium leading-relaxed">
                  {q?.question_text || 'Loading question…'}
                </h3>

                {hint && !correct && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-4 py-3 bg-amber/15 border border-amber/30 rounded-input text-amber text-sm">
                    💡 Hint: {hint}
                  </motion.div>
                )}
              </div>

              {/* Answer input */}
              <div className="flex gap-3">
                <input
                  type={q?.answer_type === 'integer' ? 'number' : 'text'}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                  placeholder={q?.answer_type === 'integer' ? 'Enter a number…' : 'Type your answer…'}
                  autoFocus
                  className={`flex-1 px-5 py-4 bg-white/10 border-2 rounded-input text-white text-lg font-mono
                    focus:outline-none transition-colors placeholder:text-white/30
                    ${wrong ? 'border-coral bg-coral/10' : correct ? 'border-teal bg-teal/10' : 'border-white/20 focus:border-teal'}`}
                />
                <button onClick={handleSubmit} disabled={loading || !answer.trim()}
                  className="btn-primary px-8">
                  Submit
                </button>
              </div>

              {correct && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-teal mt-4 font-semibold">
                  ✨ Correct! +{attempt === 1 ? 10 : 5} XP
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'payoff' && caseStudy && (
          <motion.div key="payoff" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="max-w-xl">
              <div className="text-6xl mb-6">🏆</div>
              <span className="inline-block px-3 py-1 bg-teal/20 text-teal text-xs font-semibold rounded-full mb-4">MASTERED</span>
              <h1 className="font-display text-4xl text-white font-bold mb-4">{caseStudy.title}</h1>
              <div className="w-16 h-1 bg-teal mx-auto mb-6 rounded-full" />
              <p className="text-white/60 text-lg mb-8">You've completed all {totalStages} stages!</p>
              <div className="bg-white/5 rounded-card p-6 mb-8 text-left">
                <p className="text-white/50 text-xs mb-3 uppercase tracking-wide">Real-world applications</p>
                {caseStudy.real_world?.map((rw, i) => (
                  <p key={i} className="text-white/80 text-sm mb-2 flex items-start gap-2">
                    <span className="text-teal mt-0.5">→</span> {rw}
                  </p>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                  Back to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}