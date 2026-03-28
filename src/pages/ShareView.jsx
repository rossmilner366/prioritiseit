import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts'

const STATUS_MAP = {
  backlog: { label: 'Backlog', classes: 'bg-slate-500/10 text-slate-400' },
  planned: { label: 'Planned', classes: 'bg-blue-500/10 text-blue-400' },
  in_progress: { label: 'In progress', classes: 'bg-amber-500/10 text-amber-400' },
  done: { label: 'Done', classes: 'bg-emerald-500/10 text-emerald-400' },
}

function ShareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white text-sm font-medium">{d.title}</p>
      <p className="text-xs text-slate-400 mt-0.5">Score: {Math.round(d.score)}</p>
    </div>
  )
}

function ShareDot(props) {
  const { cx, cy, payload } = props
  const initials = payload.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill="#2596BE" stroke="rgba(11,15,26,0.8)" strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={9} fontWeight={500} fontFamily="DM Sans, system-ui">{initials}</text>
    </g>
  )
}

export default function ShareView() {
  const { token } = useParams()
  const [board, setBoard] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list')

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

      setItems(itemData || [])
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-brand-400 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h1 className="text-white font-medium mb-2">Board unavailable</h1>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const maxEffort = Math.max(5, ...items.map(d => d.effort))
  const maxImpact = Math.max(3, ...items.map(d => d.impact))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-400 to-brand-500 px-6 py-8 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="text-white/70 text-xs font-medium">PrioritiseIt</span>
            <span className="ml-auto badge bg-white/15 text-white/90 text-[10px]">Read-only</span>
          </div>
          <h1 className="text-white text-2xl font-semibold">{board.name}</h1>
          {board.description && <p className="text-white/70 text-sm mt-1">{board.description}</p>}
          <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
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
          <div className="flex bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ranked list
            </button>
            <button
              onClick={() => setView('matrix')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'matrix' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Impact / effort matrix
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="space-y-2">
            {items.map((item, idx) => {
              const st = STATUS_MAP[item.status] || STATUS_MAP.backlog
              const score = item.score != null ? Math.round(item.score * 10) / 10 : 0
              return (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-sm font-medium text-slate-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.manual_rank != null && (
                        <span className="text-brand-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                        </span>
                      )}
                      <span className="text-white font-medium text-sm truncate">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{item.description}</p>
                    )}
                  </div>
                  <span className={`badge ${st.classes} shrink-0`}>{st.label}</span>
                  <span className="text-sm font-mono text-slate-400 w-12 text-right shrink-0">{score}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-6">
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <ReferenceArea x1={0} x2={maxEffort / 2} y1={maxImpact / 2} y2={maxImpact} fill="rgba(16,185,129,0.06)" />
                <ReferenceArea x1={maxEffort / 2} x2={maxEffort} y1={maxImpact / 2} y2={maxImpact} fill="rgba(59,130,246,0.06)" />
                <ReferenceArea x1={0} x2={maxEffort / 2} y1={0} y2={maxImpact / 2} fill="rgba(255,255,255,0.02)" />
                <ReferenceArea x1={maxEffort / 2} x2={maxEffort} y1={0} y2={maxImpact / 2} fill="rgba(239,68,68,0.06)" />
                <ReferenceLine x={maxEffort / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <ReferenceLine y={maxImpact / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <XAxis dataKey="effort" type="number" domain={[0, maxEffort]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}>
                  <Label value="Effort →" position="insideBottom" offset={-15} style={{ fill: '#64748b', fontSize: 12 }} />
                </XAxis>
                <YAxis dataKey="impact" type="number" domain={[0, maxImpact]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}>
                  <Label value="Impact →" angle={-90} position="insideLeft" offset={5} style={{ fill: '#64748b', fontSize: 12 }} />
                </YAxis>
                <Tooltip content={<ShareTooltip />} cursor={false} />
                <Scatter data={items} shape={<ShareDot />} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {items.map(item => {
                const initials = item.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
                return <span key={item.id}><span className="text-brand-400 font-mono">{initials}</span> = {item.title}</span>
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs">
            Powered by <span className="text-brand-400">PrioritiseIt</span> — feature prioritisation for product teams
          </p>
        </div>
      </div>
    </div>
  )
}
