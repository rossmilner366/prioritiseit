import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', classes: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400' },
  { value: 'planned', label: 'Planned', classes: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  { value: 'in_progress', label: 'In progress', classes: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  { value: 'done', label: 'Done', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
]

function getScoreColor(score) {
  if (score >= 150) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
  if (score >= 60) return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
  return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
}

function InlineNumber({ value, min, max, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        type="number"
        value={draft}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = Math.max(min, Math.min(max, parseInt(draft) || min))
          onChange(n)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        className="w-16 px-2 py-1 bg-white dark:bg-white/10 border border-brand-400/50 rounded text-center text-sm text-slate-800 dark:text-white outline-none font-mono"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      className="w-16 px-2 py-1 rounded text-center text-sm text-slate-600 dark:text-slate-300 font-mono hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-text"
    >
      {value}
    </button>
  )
}

function LinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function ItemLinkEditor({ linkUrl, onSave, onClose }) {
  const [url, setUrl] = useState(linkUrl || '')

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl p-3 min-w-[300px]">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link to design file, spec, or deck</p>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://figma.com/file/..."
            className="input-field flex-1 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onSave(url || null); onClose() }
              if (e.key === 'Escape') onClose()
            }}
          />
          <button
            onClick={() => { onSave(url || null); onClose() }}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}

function SortableRow({ item, scoringModel, midEffort, midImpact, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [showMenu, setShowMenu] = useState(false)
  const [showLinkEditor, setShowLinkEditor] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const statusObj = STATUS_OPTIONS.find(s => s.value === item.status) || STATUS_OPTIONS[0]
  const score = item.score != null ? Math.round(item.score * 10) / 10 : 0
  const quadrantKey = getQuadrant(item, midEffort, midImpact)
  const quadrant = QUADRANT_INFO[quadrantKey]

  return (
    <tr ref={setNodeRef} style={style} className="group border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-2 w-8">
        <button {...attributes} {...listeners} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
        </button>
      </td>
      <td className="py-3 px-3 relative">
        <div className="flex items-center gap-1.5">
          {item.manual_rank != null && (
            <span className="text-brand-400 shrink-0" title="Manually pinned">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
            </span>
          )}
          <span className="text-sm text-slate-800 dark:text-white font-medium truncate">{item.title}</span>
          {/* Link button */}
          {item.link_url ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-500 shrink-0 ml-1"
              title={item.link_url}
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon />
            </a>
          ) : null}
          <button
            onClick={() => setShowLinkEditor(true)}
            className={`shrink-0 ml-0.5 transition-all ${
              item.link_url
                ? 'opacity-0 group-hover:opacity-60 hover:!opacity-100 text-slate-400 dark:text-slate-500'
                : 'opacity-0 group-hover:opacity-40 hover:!opacity-100 text-slate-400 dark:text-slate-500'
            }`}
            title={item.link_url ? 'Edit link' : 'Add link'}
          >
            {item.link_url ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            ) : (
              <LinkIcon />
            )}
          </button>
          {showLinkEditor && (
            <ItemLinkEditor
              linkUrl={item.link_url}
              onSave={(url) => onUpdate(item.id, { link_url: url })}
              onClose={() => setShowLinkEditor(false)}
            />
          )}
        </div>
      </td>
      {scoringModel === 'rice' && (
        <td className="py-3 px-1">
          <InlineNumber value={item.reach} min={0} max={100} onChange={(v) => onUpdate(item.id, { reach: v })} />
        </td>
      )}
      <td className="py-3 px-1">
        <InlineNumber value={item.impact} min={1} max={scoringModel === 'ice' ? 10 : 3} onChange={(v) => onUpdate(item.id, { impact: v })} />
      </td>
      <td className="py-3 px-1">
        <InlineNumber value={item.confidence} min={1} max={scoringModel === 'ice' ? 10 : 3} onChange={(v) => onUpdate(item.id, { confidence: v })} />
      </td>
      <td className="py-3 px-1">
        <InlineNumber value={item.effort} min={1} max={scoringModel === 'ice' ? 10 : 5} onChange={(v) => onUpdate(item.id, { effort: v })} />
      </td>
      <td className="py-3 px-2">
        <span className={`score-pill text-sm ${getScoreColor(score)}`}>{score}</span>
      </td>
      <td className="py-3 px-2">
        <span className={`badge text-xs ${quadrant.classes}`}>{quadrant.label}</span>
      </td>
      <td className="py-3 px-2 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`badge text-sm ${statusObj.classes} cursor-pointer hover:opacity-80 transition-opacity`}
        >
          {statusObj.label}
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div
              className="absolute right-0 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[150px]"
              ref={(el) => {
                if (!el) return
                const rect = el.getBoundingClientRect()
                const viewportH = window.innerHeight
                if (rect.bottom > viewportH - 10) {
                  el.style.top = 'auto'
                  el.style.bottom = '100%'
                  el.style.marginBottom = '4px'
                  el.style.marginTop = '0'
                } else {
                  el.style.top = '100%'
                  el.style.bottom = 'auto'
                  el.style.marginTop = '4px'
                  el.style.marginBottom = '0'
                }
              }}
            >
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => { onUpdate(item.id, { status: s.value }); setShowMenu(false) }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                    item.status === s.value ? 'text-brand-500 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
      </td>
      <td className="py-3 px-2 w-8">
        <button
          onClick={() => { if (confirm('Delete this item?')) onDelete(item.id) }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </td>
    </tr>
  )
}

export default function ScoringTable({ items, scoringModel, onUpdateItem, onDeleteItem, onReorder, boardName }) {
  const maxEffort = Math.max(5, ...items.map(d => d.effort))
  const maxImpact = Math.max(3, ...items.map(d => d.impact))
  const midEffort = maxEffort / 2
  const midImpact = maxImpact / 2

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    onReorder(reordered)
  }

  const handleExportPNG = () => {
    const isDark = document.documentElement.classList.contains('dark')
    const scale = 2
    const isRice = scoringModel === 'rice'
    const cols = isRice
      ? ['#', 'Feature', 'Reach', 'Impact', 'Conf.', 'Effort', 'Score', 'Status']
      : ['#', 'Feature', 'Impact', 'Conf.', 'Ease', 'Score', 'Status']
    const colWidths = isRice
      ? [40, 280, 70, 70, 70, 70, 80, 100]
      : [40, 320, 80, 80, 80, 80, 100]
    const tableWidth = colWidths.reduce((a, b) => a + b, 0)
    const rowH = 40
    const headerH = 44
    const padding = 40
    const titleH = 50
    const canvasW = (tableWidth + padding * 2) * scale
    const canvasH = (titleH + headerH + rowH * items.length + padding * 2) * scale

    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    // Background
    ctx.fillStyle = isDark ? '#0B0F1A' : '#ffffff'
    ctx.fillRect(0, 0, canvasW / scale, canvasH / scale)

    // Title
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
    ctx.font = '600 16px "DM Sans", system-ui, sans-serif'
    ctx.fillText(boardName || 'Priority list', padding, padding + 20)
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'
    ctx.font = '400 11px "DM Sans", system-ui, sans-serif'
    ctx.fillText(`${scoringModel.toUpperCase()} · ${items.length} items`, padding + ctx.measureText(boardName || 'Priority list').width + 16, padding + 20)

    const tableTop = padding + titleH

    // Header row
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'
    ctx.fillRect(padding, tableTop, tableWidth, headerH)
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'
    ctx.font = '500 10px "DM Sans", system-ui, sans-serif'
    let hx = padding
    cols.forEach((col, i) => {
      const tx = i === 1 ? hx + 12 : hx + colWidths[i] / 2
      ctx.textAlign = i === 1 ? 'left' : 'center'
      ctx.fillText(col.toUpperCase(), tx, tableTop + headerH / 2 + 4)
      hx += colWidths[i]
    })

    // Header border
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(padding, tableTop + headerH)
    ctx.lineTo(padding + tableWidth, tableTop + headerH)
    ctx.stroke()

    // Data rows
    items.forEach((item, idx) => {
      const y = tableTop + headerH + idx * rowH
      const score = item.score != null ? Math.round(item.score * 10) / 10 : 0
      const status = { backlog: 'Backlog', planned: 'Planned', in_progress: 'In progress', done: 'Done' }[item.status] || item.status

      // Alternating row bg
      if (idx % 2 === 1) {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.015)' : '#fafbfc'
        ctx.fillRect(padding, y, tableWidth, rowH)
      }

      // Row border
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(padding, y + rowH)
      ctx.lineTo(padding + tableWidth, y + rowH)
      ctx.stroke()

      const values = isRice
        ? [String(idx + 1), item.title, String(item.reach), String(item.impact), String(item.confidence), String(item.effort), String(score), status]
        : [String(idx + 1), item.title, String(item.impact), String(item.confidence), String(item.effort), String(score), status]

      let rx = padding
      values.forEach((val, i) => {
        const cy = y + rowH / 2 + 4

        if (i === 1) {
          // Feature name — left aligned, bold
          ctx.textAlign = 'left'
          ctx.font = '500 13px "DM Sans", system-ui, sans-serif'
          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
          const pinned = item.manual_rank != null ? '📌 ' : ''
          ctx.fillText(pinned + val, rx + 12, cy)
        } else if (i === values.length - 1) {
          // Status badge
          ctx.textAlign = 'center'
          ctx.font = '500 11px "DM Sans", system-ui, sans-serif'
          const statusColors = {
            Backlog: { bg: isDark ? '#1e293b' : '#f1f5f9', text: isDark ? '#94a3b8' : '#64748b' },
            Planned: { bg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', text: isDark ? '#60a5fa' : '#2563eb' },
            'In progress': { bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb', text: isDark ? '#fbbf24' : '#d97706' },
            Done: { bg: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', text: isDark ? '#34d399' : '#059669' },
          }
          const sc = statusColors[val] || statusColors.Backlog
          const tw = ctx.measureText(val).width
          const badgeW = tw + 16
          const badgeX = rx + colWidths[i] / 2 - badgeW / 2
          ctx.fillStyle = sc.bg
          roundRect(ctx, badgeX, cy - 12, badgeW, 20, 4)
          ctx.fill()
          ctx.fillStyle = sc.text
          ctx.fillText(val, rx + colWidths[i] / 2, cy + 1)
        } else if (i === values.length - 2) {
          // Score pill
          ctx.textAlign = 'center'
          ctx.font = '500 12px "JetBrains Mono", monospace'
          const scoreNum = parseFloat(val)
          const scoreColor = scoreNum >= 150
            ? { bg: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', text: isDark ? '#34d399' : '#059669' }
            : scoreNum >= 60
              ? { bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb', text: isDark ? '#fbbf24' : '#d97706' }
              : { bg: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', text: isDark ? '#f87171' : '#dc2626' }
          const tw = ctx.measureText(val).width
          const pillW = tw + 16
          const pillX = rx + colWidths[i] / 2 - pillW / 2
          ctx.fillStyle = scoreColor.bg
          roundRect(ctx, pillX, cy - 12, pillW, 20, 10)
          ctx.fill()
          ctx.fillStyle = scoreColor.text
          ctx.fillText(val, rx + colWidths[i] / 2, cy + 1)
        } else {
          // Number columns
          ctx.textAlign = 'center'
          ctx.font = i === 0 ? '400 12px "DM Sans", system-ui, sans-serif' : '400 13px "JetBrains Mono", monospace'
          ctx.fillStyle = i === 0 ? (isDark ? '#64748b' : '#94a3b8') : (isDark ? '#cbd5e1' : '#475569')
          ctx.fillText(val, rx + colWidths[i] / 2, cy)
        }
        rx += colWidths[i]
      })
    })

    // Download
    canvas.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${(boardName || 'priorities').toLowerCase().replace(/\s+/g, '-')}-list.png`
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportPNG}
          className="btn-outline flex items-center gap-1.5 text-xs"
          title="Download list as PNG"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Export PNG
        </button>
      </div>
      <div className="card overflow-visible">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <table className="w-full text-left" style={{ minHeight: items.length <= 2 ? '220px' : undefined }}>
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06]">
              <th className="py-3 px-2 w-8" />
              <th className="py-3 px-3 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Feature</th>
              {scoringModel === 'rice' && (
                <th className="py-3 px-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-18">Reach</th>
              )}
              <th className="py-3 px-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-18">Impact</th>
              <th className="py-3 px-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-18">Conf.</th>
              <th className="py-3 px-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-18">
                {scoringModel === 'ice' ? 'Ease' : 'Effort'}
              </th>
              <th className="py-3 px-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-20">Score</th>
              <th className="py-3 px-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-28">Segment</th>
              <th className="py-3 px-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider w-32">Status</th>
              <th className="py-3 px-2 w-8" />
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.map(item => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    scoringModel={scoringModel}
                    midEffort={midEffort}
                    midImpact={midImpact}
                    onUpdate={onUpdateItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
