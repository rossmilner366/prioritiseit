import { useRef, useCallback } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts'

const QUADRANTS = [
  { key: 'quickWins', label: 'Quick wins', subtitle: 'High impact, low effort', light: 'rgba(16, 185, 129, 0.15)', dark: 'rgba(16, 185, 129, 0.12)', swatchLight: '#d1fae5', swatchDark: 'rgba(16, 185, 129, 0.35)', textClass: 'text-emerald-700 dark:text-emerald-400' },
  { key: 'bigBets', label: 'Big bets', subtitle: 'High impact, high effort', light: 'rgba(59, 130, 246, 0.12)', dark: 'rgba(59, 130, 246, 0.10)', swatchLight: '#dbeafe', swatchDark: 'rgba(59, 130, 246, 0.35)', textClass: 'text-blue-700 dark:text-blue-400' },
  { key: 'fillIns', label: 'Fill-ins', subtitle: 'Low impact, low effort', light: 'rgba(148, 163, 184, 0.08)', dark: 'rgba(255, 255, 255, 0.04)', swatchLight: '#f1f5f9', swatchDark: 'rgba(255, 255, 255, 0.10)', textClass: 'text-slate-500 dark:text-slate-400' },
  { key: 'avoid', label: 'Avoid', subtitle: 'Low impact, high effort', light: 'rgba(239, 68, 68, 0.12)', dark: 'rgba(239, 68, 68, 0.10)', swatchLight: '#fee2e2', swatchDark: 'rgba(239, 68, 68, 0.35)', textClass: 'text-red-700 dark:text-red-400' },
]

function jitterOverlaps(items, effortRange, impactRange) {
  const THRESHOLD_E = effortRange * 0.02
  const THRESHOLD_I = impactRange * 0.02
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

function MatrixTooltip({ active, payload, scoringModel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const effortLabel = scoringModel === 'ice' ? 'Ease' : 'Effort'
  const effortValue = scoringModel === 'ice' ? d._originalEffort : d.effort
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 shadow-xl max-w-[220px]">
      <p className="text-slate-900 dark:text-white text-sm font-medium mb-1.5">{d.title}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-400 dark:text-slate-500">Impact</p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{d.impact}</p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">{effortLabel}</p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{effortValue}</p>
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

export default function MatrixView({ items, boardName, scoringModel = 'rice' }) {
  const isDark = useIsDark()
  const chartRef = useRef(null)

  // For ICE, ease is inverted (higher = easier), so we flip it for correct quadrant placement
  const matrixItems = scoringModel === 'ice'
    ? items.map(i => ({ ...i, _originalEffort: i.effort, effort: 11 - i.effort }))
    : items

  const maxEffort = Math.max(5, ...matrixItems.map(d => d.effort))
  const maxImpact = Math.max(3, ...matrixItems.map(d => d.impact))
  const midEffort = maxEffort / 2
  const midImpact = maxImpact / 2

  const data = jitterOverlaps(matrixItems, maxEffort, maxImpact)

  const q = (key) => {
    const quad = QUADRANTS.find(q => q.key === key)
    return isDark ? quad.dark : quad.light
  }

  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const dividerStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'
  const axisStroke = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'

  const handleExportPNG = useCallback(() => {
    const container = chartRef.current
    if (!container) return

    const svgElement = container.querySelector('svg')
    if (!svgElement) return

    const svgRect = svgElement.getBoundingClientRect()
    const scale = 2 // 2x for retina quality

    // Clone SVG and inline computed styles
    const clone = svgElement.cloneNode(true)
    clone.setAttribute('width', svgRect.width)
    clone.setAttribute('height', svgRect.height)

    // Serialize to data URL
    const svgData = new XMLSerializer().serializeToString(clone)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      // Create canvas with padding for title and legend
      const padding = 60
      const legendHeight = 80
      const canvasW = svgRect.width * scale + padding * 2
      const canvasH = svgRect.height * scale + padding * 2 + legendHeight

      const canvas = document.createElement('canvas')
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d')

      // Background
      ctx.fillStyle = isDark ? '#0B0F1A' : '#ffffff'
      ctx.fillRect(0, 0, canvasW, canvasH)

      // Title
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
      ctx.font = `600 ${16 * scale}px "DM Sans", system-ui, sans-serif`
      ctx.fillText(boardName || 'Impact / Effort Matrix', padding, padding - 10)

      // Draw chart
      ctx.drawImage(img, padding, padding, svgRect.width * scale, svgRect.height * scale)

      // Legend
      const legendY = padding + svgRect.height * scale + 20
      ctx.font = `500 ${11 * scale}px "DM Sans", system-ui, sans-serif`
      let legendX = padding
      items.forEach(item => {
        const initials = item.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        ctx.fillStyle = '#2596BE'
        ctx.fillText(initials, legendX, legendY)
        const initialsWidth = ctx.measureText(initials).width
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'
        ctx.fillText(` ${item.title}`, legendX + initialsWidth, legendY)
        legendX += initialsWidth + ctx.measureText(` ${item.title}`).width + 30
      })

      // Download
      canvas.toBlob((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${(boardName || 'matrix').toLowerCase().replace(/\s+/g, '-')}-matrix.png`
        a.click()
        URL.revokeObjectURL(a.href)
      }, 'image/png')

      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [items, boardName, isDark])

  return (
    <div className="card p-6">
      {/* Header with key and export */}
      <div className="flex items-start justify-between mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
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
        <button
          onClick={handleExportPNG}
          className="btn-outline flex items-center gap-1.5 ml-4 shrink-0"
          title="Download as PNG"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Export PNG
        </button>
      </div>

      <div ref={chartRef}>
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
              <Label value={scoringModel === 'ice' ? 'Ease →' : 'Effort →'} position="insideBottom" offset={-15} style={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
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
            <Tooltip content={<MatrixTooltip scoringModel={scoringModel} />} cursor={false} />
            <Scatter data={data} shape={<MatrixDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

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
