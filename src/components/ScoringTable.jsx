import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', classes: 'bg-white/5 text-slate-400' },
  { value: 'planned', label: 'Planned', classes: 'bg-blue-500/10 text-blue-400' },
  { value: 'in_progress', label: 'In progress', classes: 'bg-amber-500/10 text-amber-400' },
  { value: 'done', label: 'Done', classes: 'bg-emerald-500/10 text-emerald-400' },
]

function getScoreColor(score) {
  if (score >= 150) return 'bg-emerald-500/10 text-emerald-400'
  if (score >= 60) return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
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
        className="w-16 px-2 py-1 bg-white/10 border border-brand-400/50 rounded text-center text-sm text-white outline-none font-mono"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      className="w-16 px-2 py-1 rounded text-center text-sm text-slate-300 font-mono hover:bg-white/5 transition-colors cursor-text"
    >
      {value}
    </button>
  )
}

function SortableRow({ item, scoringModel, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [showMenu, setShowMenu] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const statusObj = STATUS_OPTIONS.find(s => s.value === item.status) || STATUS_OPTIONS[0]
  const score = item.score != null ? Math.round(item.score * 10) / 10 : 0

  return (
    <tr ref={setNodeRef} style={style} className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-2 w-8">
        <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
        </button>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          {item.manual_rank != null && (
            <span className="text-brand-400 shrink-0" title="Manually pinned">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
            </span>
          )}
          <span className="text-sm text-white font-medium truncate">{item.title}</span>
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
            <div className="absolute right-0 bottom-full mb-1 z-20 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[150px]"
              style={{
                bottom: 'auto',
                top: (() => {
                  return undefined
                })()
              }}
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
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                    item.status === s.value ? 'text-brand-400' : 'text-slate-300'
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
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </td>
    </tr>
  )
}

export default function ScoringTable({ items, scoringModel, onUpdateItem, onDeleteItem, onReorder }) {
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

  return (
    <div className="card overflow-visible">
      <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
        <table className="w-full text-left" style={{ minHeight: items.length <= 2 ? '220px' : undefined }}>
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="py-3 px-2 w-8" />
              <th className="py-3 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Feature</th>
              {scoringModel === 'rice' && (
                <th className="py-3 px-1 text-xs font-medium text-slate-500 uppercase tracking-wider w-18">Reach</th>
              )}
              <th className="py-3 px-1 text-xs font-medium text-slate-500 uppercase tracking-wider w-18">Impact</th>
              <th className="py-3 px-1 text-xs font-medium text-slate-500 uppercase tracking-wider w-18">Conf.</th>
              <th className="py-3 px-1 text-xs font-medium text-slate-500 uppercase tracking-wider w-18">
                {scoringModel === 'ice' ? 'Ease' : 'Effort'}
              </th>
              <th className="py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Score</th>
              <th className="py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Status</th>
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
  )
}
