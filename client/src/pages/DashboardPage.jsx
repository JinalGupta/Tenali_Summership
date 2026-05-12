import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const ILLUSTRATIONS = [
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><circle cx="40" cy="40" r="36" stroke="#0F2D5A" strokeWidth="2" /><circle cx="40" cy="40" r="4" fill="#0F2D5A" /><path d="M40 40 L40 16" stroke="#009B83" strokeWidth="3" strokeLinecap="round" /><path d="M40 40 L56 52" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />{[...Array(12)].map((_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return <circle key={i} cx={40 + 30 * Math.cos(a)} cy={40 + 30 * Math.sin(a)} r="2" fill="#0F2D5A" /> })}</svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">{[[20,60],[60,60],[40,20],[10,30],[70,30]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="6" fill="#0F2D5A" />)}{[[20,60,40,20],[20,60,60,60],[40,20,60,60],[40,20,10,30],[40,20,70,30],[10,30,20,60],[70,30,60,60]].map(([x1,y1,x2,y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#009B83" strokeWidth="1.5" />)}</svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><circle cx="36" cy="40" r="24" stroke="#0F2D5A" strokeWidth="2" /><circle cx="44" cy="40" r="24" stroke="#009B83" strokeWidth="2" /><circle cx="40" cy="40" r="4" fill="#E84D3A" /></svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">{[0,1,2,3,4].map(i => <rect key={i} x={8 + i*14} y={28} width={10} height={14} rx="2" fill={i < 3 ? '#009B83' : '#E84D3A'} opacity={i < 3 ? 1 : 0.3} />)}{[0,1,2,3,4].map(i => <rect key={i} x={8 + i*14} y={48} width={10} height={14} rx="2" fill={i < 4 ? '#009B83' : '#E84D3A'} opacity={i < 4 ? 1 : 0.3} />)}</svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><rect x="10" y="20" width="60" height="40" rx="2" stroke="#0F2D5A" strokeWidth="2" fill="none" /><rect x="10" y="20" width="36" height="24" rx="2" stroke="#009B83" strokeWidth="2" fill="none" /><rect x="10" y="20" width="12" height="12" rx="1" stroke="#F5A623" strokeWidth="2" fill="none" /></svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><circle cx="40" cy="40" r="28" stroke="#0F2D5A" strokeWidth="2" fill="none" />{[...Array(7)].map((_, i) => { const a = (i * 51.4 - 90) * Math.PI / 180; return <g key={i}><circle cx={40 + 22 * Math.cos(a)} cy={40 + 22 * Math.sin(a)} r={i===3?'4':'2'} fill={i===3?'#E84D3A':'#0F2D5A'} /><text x={40 + 32 * Math.cos(a)} y={43 + 32 * Math.sin(a)} fontSize="7" textAnchor="middle" fill="#6B7280">{i}</text></g> })}<path d="M40 40 L65 20" stroke="#009B83" strokeWidth="2.5" /></svg>,
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><circle cx="40" cy="16" r="7" fill="#0F2D5A" /><circle cx="20" cy="36" r="6" fill="#009B83" /><circle cx="60" cy="36" r="6" fill="#009B83" /><circle cx="10" cy="58" r="5" fill="#F5A623" /><circle cx="28" cy="58" r="5" fill="#F5A623" /><circle cx="52" cy="58" r="5" fill="#F5A623" /><circle cx="70" cy="58" r="5" fill="#F5A623" /><line x1="40" y1="23" x2="20" y2="30" stroke="#0F2D5A" strokeWidth="1.5" /><line x1="40" y1="23" x2="60" y2="30" stroke="#0F2D5A" strokeWidth="1.5" /><line x1="20" y1="42" x2="10" y2="53" stroke="#0F2D5A" strokeWidth="1.5" /><line x1="20" y1="42" x2="28" y2="53" stroke="#0F2D5A" strokeWidth="1.5" /><line x1="60" y1="42" x2="52" y2="53" stroke="#0F2D5A" strokeWidth="1.5" /><line x1="60" y1="42" x2="70" y2="53" stroke="#0F2D5A" strokeWidth="1.5" /></svg>,
]

const STATUS_LABELS = { not_started: 'Not Started', in_progress: 'In Progress', mastered: 'Mastered' }
const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-muted',
  in_progress: 'bg-amber/15 text-amber',
  mastered: 'bg-teal/15 text-teal',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, token, logout, fetchMe } = useAuthStore()
  const [caseStudies, setCaseStudies] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMe() }, [])
  useEffect(() => { if (!token) navigate('/login') }, [token])

  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
      try {
        const [csRes, progRes] = await Promise.all([
          axios.get(`${API}/case-studies`),
          axios.get(`${API}/progress`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setCaseStudies(csRes.data)
        const map = {}
        for (const p of progRes.data) map[p.case_study_id] = p
        setProgressMap(map)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (!token) return null

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy px-6 py-4 flex items-center justify-between">
        <span className="font-display text-2xl text-white font-bold">Tenali</span>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{user?.name || 'Loading…'}</p>
            <p className="text-white/50 text-xs">{user?.total_xp || 0} XP</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <button onClick={logout} className="text-white/50 text-sm hover:text-white transition-colors ml-2">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-navy mb-2">
            {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Loading…'}
          </h1>
          <p className="text-muted">Choose a case study to begin your learning journey.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-muted">Loading case studies…</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((cs, idx) => {
              const prog = progressMap[cs.id] || {}
              const status = prog.status || 'not_started'
              const stage = prog.current_stage || 1
              const totalStages = 7
              return (
                <div
                  key={cs.id}
                  onClick={() => navigate(`/learn/${cs.id}`)}
                  className="card p-6 flex flex-col items-center text-center cursor-pointer hover:border-teal transition-all"
                >
                  <div className="w-20 h-20 mb-4 text-navy">
                    {ILLUSTRATIONS[idx % ILLUSTRATIONS.length]}
                  </div>
                  <h3 className="font-display text-lg text-navy font-semibold mb-1 leading-tight">{cs.title}</h3>
                  <p className="text-sm text-muted mb-4 line-clamp-2">{cs.core_idea}</p>
                  {status !== 'not_started' && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                      <div className="h-1.5 rounded-full bg-teal transition-all" style={{ width: `${(stage / totalStages) * 100}%` }} />
                    </div>
                  )}
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${STATUS_COLORS[status]}`}>
                    {status === 'in_progress' ? `Step ${stage} / ${totalStages}` : STATUS_LABELS[status]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}