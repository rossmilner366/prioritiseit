import { useState } from 'react'
import { LogoMark } from '../components/Logo'

function FeaturePoint({ icon, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-400/10 dark:bg-brand-400/15 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

export default function AuthPage({ onEmailSignIn, onGoogleSignIn, theme, toggleTheme }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await onEmailSignIn(email)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/[0.03] rounded-full" />

        <div className="relative">
          <LogoMark size={48} className="mb-8" />
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            Prioritise with<br />clarity, share with<br />confidence
          </h1>
          <p className="text-white/60 text-sm max-w-xs">
            The fastest way to go from a list of ideas to a stakeholder-ready priority view.
          </p>
        </div>

        <div className="relative space-y-5">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">RICE, ICE & WSJF scoring</p>
              <p className="text-xs text-white/50 mt-0.5">Structured frameworks, not guesswork</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">One-click stakeholder sharing</p>
              <p className="text-xs text-white/50 mt-0.5">No login required for viewers</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Export-ready visuals</p>
              <p className="text-xs text-white/50 mt-0.5">Impact/effort matrix straight into your deck</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/30">
          Made for product teams who ship
        </p>
      </div>

      {/* Right panel — sign in form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo (hidden on desktop where left panel shows) */}
          <div className="text-center mb-8 lg:mb-10">
            <div className="lg:hidden flex justify-center mb-5">
              <LogoMark size={56} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              <span className="lg:hidden">Prioritise<span className="text-brand-400">It</span></span>
              <span className="hidden lg:inline">Welcome back</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              <span className="lg:hidden">Score, rank, and share feature priorities</span>
              <span className="hidden lg:inline">Sign in to your account to continue</span>
            </p>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-7 shadow-sm dark:shadow-none">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-brand-50 dark:bg-brand-400/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Check your inbox</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  We sent a sign-in link to{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{email}</span>
                </p>
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="mt-5 text-brand-500 dark:text-brand-400 text-sm font-medium hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-field text-base py-2.5"
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-2.5 text-base flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Continue with email'
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-[#0d1117] px-3 text-xs text-slate-400 dark:text-slate-500">or</span>
                  </div>
                </div>

                <button
                  onClick={onGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98] transition-all"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </div>

          <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-6">
            No password required — we&apos;ll email you a magic link
          </p>

          {/* Mobile feature points */}
          <div className="lg:hidden mt-10 space-y-4">
            <FeaturePoint
              icon={<svg className="w-4 h-4 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              title="RICE & ICE scoring"
              desc="Structured frameworks, not guesswork"
            />
            <FeaturePoint
              icon={<svg className="w-4 h-4 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
              title="One-click stakeholder sharing"
              desc="No login required for viewers"
            />
            <FeaturePoint
              icon={<svg className="w-4 h-4 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              title="Export-ready visuals"
              desc="Impact/effort matrix straight into your deck"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
