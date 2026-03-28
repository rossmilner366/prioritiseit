import { useState } from 'react'

export default function AuthPage({ onEmailSignIn, onGoogleSignIn }) {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-50 dark:bg-brand-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-50 dark:bg-brand-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-400 rounded-2xl mb-5">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">PrioritiseIt</h1>
          <p className="text-slate-400 text-sm">Score, rank, and share feature priorities</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-400/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-white font-medium mb-1">Check your inbox</h2>
              <p className="text-slate-400 text-sm">We sent a sign-in link to <span className="text-slate-300">{email}</span></p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-4 text-brand-400 text-sm hover:text-brand-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Continue with email'
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-50 dark:bg-slate-950 px-3 text-xs text-slate-500">or</span>
                </div>
              </div>

              <button
                onClick={onGoogleSignIn}
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {error && (
                <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
              )}
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          No password required — we&apos;ll email you a magic link
        </p>
      </div>
    </div>
  )
}
