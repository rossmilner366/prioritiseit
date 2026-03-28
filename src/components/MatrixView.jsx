import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts'

const QUADRANT_COLORS = {
  quickWins: 'rgba(16, 185, 129, 0.06)',
  bigBets: 'rgba(59, 130, 246, 0.06)',
  fillIns: 'rgba(255, 255, 255, 0.02)',
  avoid: 'rgba(239, 68, 68, 0.06)',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white text-sm font-medium mb-1">{d.title}</p>
      <div className="flex gap-3 text-xs text-slate-400">
        <span>Impact: {d.impact}</span>
        <span>Effort: {d.effort}</span>
        <span>Score: {Math.round(d.score)}</span>
      </div>
    </div>
  )
}

function CustomDot(props) {
  const { cx, cy, payload } = props
  const initials = payload.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill="#2596BE" stroke="rgba(11, 15, 26, 0.8)" strokeWidth={2.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={10} fontWeight={500} fontFamily="DM Sans, system-ui">
        {initials}
      </text>
    </g>
  )
}

export default function MatrixView({ items }) {
  const data = items.map(item => ({
    ...item,
    effort: item.effort,
    impact: item.impact,
  }))

  const maxEffort = Math.max(5, ...data.map(d => d.effort))
  const maxImpact = Math.max(3, ...data.map(d => d.impact))
  const midEffort = maxEffort / 2
  const midImpact = maxImpact / 2

  return (
    <div className="card p-6">
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16, 185, 129, 0.25)' }} />
          <span className="text-slate-400">Quick wins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(59, 130, 246, 0.25)' }} />
          <span className="text-slate-400">Big bets</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <span className="text-slate-400">Fill-ins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239, 68, 68, 0.25)' }} />
          <span className="text-slate-400">Avoid</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

          {/* Quadrant backgrounds */}
          <ReferenceArea x1={0} x2={midEffort} y1={midImpact} y2={maxImpact} fill={QUADRANT_COLORS.quickWins} />
          <ReferenceArea x1={midEffort} x2={maxEffort} y1={midImpact} y2={maxImpact} fill={QUADRANT_COLORS.bigBets} />
          <ReferenceArea x1={0} x2={midEffort} y1={0} y2={midImpact} fill={QUADRANT_COLORS.fillIns} />
          <ReferenceArea x1={midEffort} x2={maxEffort} y1={0} y2={midImpact} fill={QUADRANT_COLORS.avoid} />

          <ReferenceLine x={midEffort} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <ReferenceLine y={midImpact} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

          <XAxis
            dataKey="effort"
            type="number"
            domain={[0, maxEffort]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          >
            <Label value="Effort →" position="insideBottom" offset={-15} style={{ fill: '#64748b', fontSize: 12 }} />
          </XAxis>
          <YAxis
            dataKey="impact"
            type="number"
            domain={[0, maxImpact]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          >
            <Label value="Impact →" angle={-90} position="insideLeft" offset={5} style={{ fill: '#64748b', fontSize: 12 }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {items.map(item => {
          const initials = item.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
          return (
            <span key={item.id}>
              <span className="text-brand-400 font-mono">{initials}</span> = {item.title}
            </span>
          )
        })}
      </div>
    </div>
  )
}
