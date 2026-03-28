import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts'

const QUADRANTS = [
  { key: 'quickWins', label: 'Quick wins', subtitle: 'High impact, low effort', light: 'rgba(16, 185, 129, 0.15)', dark: 'rgba(16, 185, 129, 0.12)', swatchLight: '#d1fae5', swatchDark: 'rgba(16, 185, 129, 0.35)', textClass: 'text-emerald-700 dark:text-emerald-400' },
  { key: 'bigBets', label: 'Big bets', subtitle: 'High impact, high effort', light: 'rgba(59, 130, 246, 0.12)', dark: 'rgba(59, 130, 246, 0.10)', swatchLight: '#dbeafe', swatchDark: 'rgba(59, 130, 246, 0.35)', textClass: 'text-blue-700 dark:text-blue-400' },
  { key: 'fillIns', label: 'Fill-ins', subtitle: 'Low impact, low effort', light: 'rgba(148, 163, 184, 0.08)', dark: 'rgba(255, 255, 255, 0.04)', swatchLight: '#f1f5f9', swatchDark: 'rgba(255, 255, 255, 0.10)', textClass: 'text-slate-500 dark:text-slate-400' },
  { key: 'avoid', label: 'Avoid', subtitle: 'Low impact, high effort', light: 'rgba(239, 68, 68, 0.12)', dark: 'rgba(239, 68, 68, 0.10)', swatchLight: '#fee2e2', swatchDark: 'rgba(239, 68, 68, 0.35)', textClass: 'text-red-700 dark:text-red-400' },
]

// Spread items that share exact or near-identical coordinates
// Jitter is minimal — just enough to separate visually without misrepresenting the data
function jitterOverlaps(items, effortRange, impactRange) {
  const THRESHOLD_E = effortRange * 0.02
  const THRESHOLD_I = impactRange * 0.02
  // Jitter by roughly 1 dot-width in chart coordinates
  const JITTER_E = effortRange * 0.025
  const JITTER_I = impactRange * 0.025

  const result = items.map(item => ({
    ...item,
    _effort: item.effort,
    _impact: item.impact,
  }))

  const placed = []
  for (const item of result) {
    const overlaps = placed.filter(p =>
      Math.abs(p._effort - item._effort) < THRESHOLD_E &&
      Math.abs(p._impact - item._impact) < THRESHOLD_I
    )
    if (overlaps.length > 0) {
      const total = overlaps.length + 1
      // Spread all items in the cluster evenly around the true position
      for (let i = 0; i < overlaps.length; i++) {
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2
        overlaps[i]._effort = overlaps[i].effort + Math.cos(angle) * JITTER_E
        overlaps[i]._impact = overlaps[i].impact + Math.sin(angle) * JITTER_I
      }
      const myAngle = (overlaps.length / total) * 2 * Math.PI - Math.PI / 2
      item._effort = item.effort + Math.cos(myAngle) * JITTER_E
      item._impact = item.impact + Math.sin(myAngle) * JITTER_I
    }
    placed.push(item)
  }

  return result
}

function MatrixTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 shadow-xl max-w-[220px]">
      <p className="text-slate-900 dark:text-white text-sm font-medium mb-1.5">{d.title}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-400 dark:text-slate-500">Impact</p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{d.impact}</p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">Effort</p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{d.effort}</p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">Score</p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{Math.round(d.score)}</p>
        </div>
      </div>
    </div>
  )
}

function MatrixDot(props) {
  const { cx, cy, payload } = props
  const initials = payload.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <g style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={20} fill="#2596BE" stroke="white" strokeWidth={2.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={500} fontFamily="DM Sans, system-ui">
        {initials}
      </text>
    </g>
  )
}

function useIsDark() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

export default function MatrixView({ items }) {
  const isDark = useIsDark()

  const maxEffort = Math.max(5, ...items.map(d => d.effort))
  const maxImpact = Math.max(3, ...items.map(d => d.impact))
  const midEffort = maxEffort / 2
  const midImpact = maxImpact / 2

  const data = jitterOverlaps(items, maxEffort, maxImpact)

  const q = (key) => {
    const quad = QUADRANTS.find(q => q.key === key)
    return isDark ? quad.dark : quad.light
  }

  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const dividerStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'
  const axisStroke = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'

  return (
    <div className="card p-6">
      {/* Quadrant key */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {QUADRANTS.map(quad => (
          <div
            key={quad.key}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/[0.06]"
            style={{ background: isDark ? quad.swatchDark : quad.swatchLight }}
          >
            <div className="min-w-0">
              <p className={`text-sm font-medium ${quad.textClass}`}>{quad.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{quad.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />

          <ReferenceArea x1={0} x2={midEffort} y1={midImpact} y2={maxImpact} fill={q('quickWins')} />
          <ReferenceArea x1={midEffort} x2={maxEffort} y1={midImpact} y2={maxImpact} fill={q('bigBets')} />
          <ReferenceArea x1={0} x2={midEffort} y1={0} y2={midImpact} fill={q('fillIns')} />
          <ReferenceArea x1={midEffort} x2={maxEffort} y1={0} y2={midImpact} fill={q('avoid')} />

          <ReferenceLine x={midEffort} stroke={dividerStroke} strokeDasharray="6 4" strokeWidth={1.5} />
          <ReferenceLine y={midImpact} stroke={dividerStroke} strokeDasharray="6 4" strokeWidth={1.5} />

          <XAxis
            dataKey="_effort"
            type="number"
            domain={[0, maxEffort]}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: axisStroke }}
            tickLine={false}
          >
            <Label value="Effort →" position="insideBottom" offset={-15} style={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
          </XAxis>
          <YAxis
            dataKey="_impact"
            type="number"
            domain={[0, maxImpact]}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: axisStroke }}
            tickLine={false}
          >
            <Label value="Impact →" angle={-90} position="insideLeft" offset={5} style={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
          </YAxis>
          <Tooltip content={<MatrixTooltip />} cursor={false} />
          <Scatter data={data} shape={<MatrixDot />} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Item legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium uppercase tracking-wider">Items</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {items.map(item => {
            const initials = item.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            return (
              <span key={item.id} className="text-slate-500 dark:text-slate-400">
                <span className="text-brand-500 dark:text-brand-400 font-mono font-medium">{initials}</span> {item.title}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
