import { motion } from 'framer-motion'

export default function HelloPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-amber/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <span className="inline-block px-4 py-1.5 bg-teal/20 text-teal text-sm font-semibold rounded-full mb-6 tracking-wide">
          EDUCATIONAL DESIGN LAB
        </span>

        <h1 className="font-display text-7xl md:text-8xl font-bold text-white mb-4">
          Tenali
        </h1>

        <p className="text-teal text-xl md:text-2xl font-body mb-2">
          Learn Through Wonder
        </p>

        <div className="w-24 h-1 bg-teal mx-auto mt-6 rounded-full" />

        <p className="text-white/60 text-lg mt-8 font-body max-w-md mx-auto">
          Mathematical theorems. Story-driven learning.<br />
          Adaptive questions. Incremental mastery.
        </p>

        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <Link to="/login" className="px-8 py-3 bg-teal text-white font-semibold rounded-btn hover:bg-teal-dark transition-colors">
            Log in
          </Link>
          <Link to="/register" className="px-8 py-3 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-btn hover:bg-white/20 transition-colors">
            Create account
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3 justify-center">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <p className="text-white/40 text-sm font-mono">v0.2 — Auth + Backend wired</p>
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
        </div>
      </motion.div>
    </div>
  )
}