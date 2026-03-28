import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogoMark } from '../components/Logo'
import MatrixView from '../components/MatrixView'

const QUADRANT_INFO = {
  quickWins: { label: 'Quick win', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  bigBets:   { label: 'Big bet',   classes: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  fillIns:   { label: 'Fill-in',   classes: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400' },
  avoid:     { label: 'Avoid',     classes: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
}

function getQuadrant(item, midEffort, midImpact) {
  if (item.impact > midImpact && item.effort <= midEffort) return 'quickWins'
  if (item.impact > midImpact && item.effort > midEffort) return 'bigBets'
  if (item.impact <= midImpact && item.effort <= midEffort) return 'fillIns'
  return 'avoid'
}

const STATUS_MAP = {
  backlog: { label: 'Backlog', classes: 'bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400' },
  planned: { label: 'Planned', classes: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  in_progress: { label: 'In progress', classes: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  done: { label: 'Done', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
}

export default function ShareView() {
  const { token } = useParams()
  const [board, setBoard] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list')

  // Share view respects system preference for dark/light
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    async function load() {
      const { data: boards, error: bErr } = await supabase
        .from('boards')
        .select('*')
        .eq('share_token', token)
        .eq('is_shared', true)
        .limit(1)

      if (bErr || !boards?.length) {
        setError('Board not found or sharing has been disabled')
        setLoading(false)
        return
      }

      const b = boards[0]
      setBoard(b)

      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .eq('board_id', b.id)
        .order('manual_rank', { ascending: true, nullsFirst: false })
        .order('score', { ascending: false })

      const processedItems = (itemData || []).map(item => {
        if (b.scoring_model === 'wsjf') {
          return { ...item, score: item.effort > 0 ? (item.reach + item.impact + item.confidence) / item.effort : 0 }
        }
        if (b.scoring_model === 'ice') {
          return { ...item, score: item.impact * item.confidence * item.effort }
        }
        return item
      })
      setItems(processedItems)
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogoMark size={56} />
          </div>
          <h1 className="text-slate-900 dark:text-white font-medium mb-2">Board unavailable</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-400 to-brand-500 px-6 py-10 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <LogoMark size={32} />
            <span className="text-white/70 text-sm font-medium">Prioritise<span className="text-white/90">It</span></span>
            <span className="ml-auto badge bg-white/15 text-white/90 text-xs">Read-only</span>
          </div>
          <h1 className="text-white text-4xl font-semibold">{board.name}</h1>
          {board.description && <p className="text-white/70 text-base mt-2">{board.description}</p>}
          <div className="flex items-center gap-2 mt-4 text-white/50 text-sm">
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="uppercase font-mono tracking-wider">{board.scoring_model}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Updated {new Date(board.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8">
        {/* View toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-100 dark:bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Ranked list
            </button>
            {board.scoring_model !== 'wsjf' && (
              <button
                onClick={() => setView('matrix')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'matrix'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Impact / effort matrix
              </button>
            )}
          </div>
        </div>

        {view === 'list' ? (() => {
          const maxEffort = Math.max(5, ...items.map(d => d.effort))
          const maxImpact = Math.max(3, ...items.map(d => d.impact))
          const midEffort = maxEffort / 2
          const midImpact = maxImpact / 2
          return (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const st = STATUS_MAP[item.status] || STATUS_MAP.backlog
                const score = item.score != null ? Math.round(item.score * 10) / 10 : 0
                const quadrant = QUADRANT_INFO[getQuadrant(item, midEffort, midImpact)]
                return (
                  <div key={item.id} className="card p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.manual_rank != null && (
                          <span className="text-brand-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                          </span>
                        )}
                        <span className="text-slate-900 dark:text-white font-medium text-sm truncate">{item.title}</span>
                        {item.link_url && (
                          <a
                            href={item.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-500 shrink-0"
                            title="View linked resource"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-slate-400 text-xs mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    <span className={`badge ${quadrant.classes} shrink-0`}>{quadrant.label}</span>
                    <span className={`badge ${st.classes} shrink-0`}>{st.label}</span>
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400 w-12 text-right shrink-0">{score}</span>
                  </div>
                )
              })}
            </div>
          )
        })() : (
          <MatrixView items={items} scoringModel={board.scoring_model} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 dark:text-slate-600 text-xs">
            Powered by <span className="text-brand-500 dark:text-brand-400">Prioritise<span className="font-semibold">It</span></span> — feature prioritisation for product teams
          </p>
        </div>
      </div>
    </div>
  )
}
