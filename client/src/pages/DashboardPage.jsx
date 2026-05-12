import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy px-6 py-4 flex items-center justify-between">
        <span className="font-display text-2xl text-white font-bold">Tenali</span>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white font-bold text-sm">PS</div>
          <span className="text-white/80 text-sm font-medium">Priya Sharma</span>
          <button className="text-white/50 text-sm hover:text-white transition-colors">Logout</button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-navy mb-2">Welcome back, Priya</h1>
          <p className="text-muted">Choose a case study to begin your learning journey.</p>
        </div>

        {/* Case study grid — placeholder, real data in v0.3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} className="card p-6 flex flex-col items-center text-center cursor-pointer hover:border-teal">
              <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mb-4">
                <span className="text-2xl">∞</span>
              </div>
              <h3 className="font-display text-lg text-navy font-semibold mb-1">Case Study {n}</h3>
              <p className="text-sm text-muted">Theorem name</p>
              <span className="mt-4 px-3 py-1 bg-gray-100 text-muted text-xs rounded-full">Not Started</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}