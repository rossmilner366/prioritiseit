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

const RICE_GUIDE = {
  reach: {
    label: 'Reach',
    question: 'How many users or sessions will this affect per quarter?',
    scale: '0–100',
    levels: [
      { range: '80–100', label: 'Very high', desc: 'Affects most of your user base', color: 'text-emerald-400' },
      { range: '50–79', label: 'High', desc: 'Affects a significant portion of users', color: 'text-emerald-400' },
      { range: '20–49', label: 'Medium', desc: 'Affects a moderate segment', color: 'text-amber-400' },
      { range: '1–19', label: 'Low', desc: 'Niche feature, small user group', color: 'text-red-400' },
    ],
    tips: 'Use real data where possible — GA sessions, active users, support ticket volume. Estimate when you must, but note your confidence accordingly.',
  },
  impact: {
    label: 'Impact',
    question: 'How much will this move the needle for users who encounter it?',
    scale: '1–3',
    levels: [
      { range: '3', label: 'High', desc: 'Transforms the experience, removes major pain point, directly drives a key metric', color: 'text-emerald-400' },
      { range: '2', label: 'Medium', desc: 'Noticeable improvement, solves a real problem but not a critical one', color: 'text-amber-400' },
      { range: '1', label: 'Low', desc: 'Nice to have, incremental polish, quality-of-life improvement', color: 'text-red-400' },
    ],
    tips: 'Think about the outcome, not the feature. "Add filters" is low impact; "Help users find products 3x faster" is high impact. Score the outcome.',
  },
  confidence: {
    label: 'Confidence',
    question: 'How confident are you in your Reach and Impact estimates?',
    scale: '1–3',
    levels: [
      { range: '3', label: 'High', desc: 'Backed by data — analytics, user research, A/B test results, or strong comparable evidence', color: 'text-emerald-400' },
      { range: '2', label: 'Medium', desc: 'Informed opinion — some supporting data, customer feedback, or industry patterns', color: 'text-amber-400' },
      { range: '1', label: 'Low', desc: 'Gut feel — hypothesis without strong evidence, novel territory', color: 'text-red-400' },
    ],
    tips: 'Be honest. Low confidence isn\'t bad — it means you should validate before committing. It naturally deprioritises speculative ideas, which is the point.',
  },
  effort: {
    label: 'Effort',
    question: 'How many person-weeks will this take to ship?',
    scale: '1–5',
    levels: [
      { range: '1', label: 'Tiny', desc: 'A few hours to a day — config change, copy update, small tweak', color: 'text-emerald-400' },
      { range: '2', label: 'Small', desc: '1–2 weeks — single dev, well-understood scope', color: 'text-emerald-400' },
      { range: '3', label: 'Medium', desc: '3–4 weeks — needs design + dev, some complexity', color: 'text-amber-400' },
      { range: '4', label: 'Large', desc: '5–8 weeks — multiple contributors, dependencies', color: 'text-red-400' },
      { range: '5', label: 'XL', desc: '8+ weeks — large initiative, cross-team coordination', color: 'text-red-400' },
    ],
    tips: 'Include design, development, QA, and rollout. A common mistake is scoring dev effort only. If it needs legal review or partner coordination, factor that in.',
  },
}

const ICE_GUIDE = {
  impact: {
    label: 'Impact',
    question: 'If this works, how much will it move the needle?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Transformative', desc: 'Game-changing for the business or user experience', color: 'text-emerald-400' },
      { range: '5–7', label: 'Significant', desc: 'Clear, measurable improvement', color: 'text-amber-400' },
      { range: '2–4', label: 'Moderate', desc: 'Helpful but not a major shift', color: 'text-amber-400' },
      { range: '1', label: 'Minimal', desc: 'Barely noticeable difference', color: 'text-red-400' },
    ],
    tips: 'Score relative to your current goals. A feature that\'s high impact for acquisition might be low impact if your focus is retention.',
  },
  confidence: {
    label: 'Confidence',
    question: 'How sure are you this will work?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Proven', desc: 'Strong data, validated by research or previous tests', color: 'text-emerald-400' },
      { range: '5–7', label: 'Likely', desc: 'Good evidence, informed by customer feedback or patterns', color: 'text-amber-400' },
      { range: '2–4', label: 'Uncertain', desc: 'Hypothesis based on intuition, limited data', color: 'text-amber-400' },
      { range: '1', label: 'Speculative', desc: 'Pure bet, no supporting evidence', color: 'text-red-400' },
    ],
    tips: 'If you\'d want to run an experiment before committing, your confidence is probably 5 or below.',
  },
  effort: {
    label: 'Ease',
    question: 'How easy is this to implement?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Trivial', desc: 'Quick config, simple change, no dependencies', color: 'text-emerald-400' },
      { range: '5–7', label: 'Manageable', desc: 'Standard project, clear scope, known territory', color: 'text-amber-400' },
      { range: '2–4', label: 'Hard', desc: 'Complex, cross-team, new technology or uncertain scope', color: 'text-red-400' },
      { range: '1', label: 'Extremely hard', desc: 'Major initiative, many unknowns, high coordination', color: 'text-red-400' },
    ],
    tips: 'ICE inverts effort — higher is easier. This means easy wins naturally score higher, which is the trade-off vs RICE\'s more granular effort scale.',
  },
}

function getScoreColor(score) {
  if (score >= 150) return 'bg-emerald-500/10 text-emerald-400'
  if (score >= 60) return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function HelpIcon() {
  return (
    <svg className="w-3 h-3 inline-block ml-1 opacity-40 group-hover/th:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
    </svg>
  )
}

function ColumnTooltip({ guide, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <p className="text-white text-sm font-medium mb-1">{guide.label}</p>
          <p className="text-slate-400 text-xs leading-relaxed">{guide.question}</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {guide.levels.map((level) => (
            <div key={level.range} className="flex items-start gap-2">
              <span className={`text-xs font-mono font-medium w-10 shrink-0 ${level.color}`}>{level.range}</span>
              <div className="min-w-0">
                <span className="text-white text-xs font-medium">{level.label}</span>
                <span className="text-slate-500 text-xs"> — {level.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-brand-400/5 border-t border-white/[0.04]">
          <p className="text-brand-300/80 text-[11px] leading-relaxed">{guide.tips}</p>
        </div>
      </div>
    </>
  )
}

function ScoringGuidePanel({ scoringModel, onClose }) {
  const guide = scoringModel === 'rice' ? RICE_GUIDE : ICE_GUIDE
  const factors = scoringModel === 'rice'
    ? ['reach', 'impact', 'confidence', 'effort']
    : ['impact', 'confidence', 'effort']

  const formula = scoringModel === 'rice'
    ? 'Score = (Reach × Impact × Confidence) ÷ Effort'
    : 'Score = Impact × Confidence × Ease'

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white text-sm font-medium">{scoringModel.toUpperCase()} scoring guide</h3>
          <p className="text-slate-400 text-xs mt-0.5">How to score your features consistently</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white/[0.03] rounded-lg px-4 py-2.5 mb-4">
        <p className="text-sm font-mono text-brand-400">{formula}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {factors.map(key => {
          const g = guide[key]
          return (
            <div key={key} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-xs font-medium">{g.label}</span>
                <span className="text-slate-500 text-[10px] font-mono">{g.scale}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-2.5">{g.question}</p>
              <div className="space-y-1.5">
                {g.levels.map(level => (
                  <div key={level.range} className="flex items-baseline gap-1.5">
                    <span className={`text-[10px] font-mono font-medium w-10 shrink-0 ${level.color}`}>{level.range}</span>
                    <span className="text-slate-500 text-[10px]">{level.label} — {level.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 bg-brand-400/5 border border-brand-400/10 rounded-lg px-4 py-3">
        <p className="text-brand-300/80 text-[11px] leading-relaxed">
          {scoringModel === 'rice'
            ? 'Higher scores = higher priority. Features with high reach and impact but low effort rise to the top. Low confidence naturally penalises speculative ideas, encouraging you to validate assumptions before committing resources.'
            : 'Higher scores = higher priority. ICE is faster than RICE — good for rapid triage and early-stage product decisions where you don\'t have detailed reach data yet.'
          }
        </p>
      </div>
    </div>
  )
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
        className="w-14 px-1.5 py-0.5 bg-white/10 border border-brand-400/50 rounded text-center text-sm text-white outline-none font-mono"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      className="w-14 px-1.5 py-0.5 rounded text-center text-sm text-slate-300 font-mono hover:bg-white/5 transition-colors cursor-text"
    >
      {value}
    </button>
  )
}

function HeaderWithHelp({ label, guide }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <th className="py-3 px-1 text-xs font-medium text-slate-500 uppercase tracking-wider w-16 relative group/th">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-0.5 hover:text-slate-300 transition-colors"
      >
        {label}
        <HelpIcon />
      </button>
      {showTooltip && <ColumnTooltip guide={guide} onClose={() => setShowTooltip(false)} />}
    </th>
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
      <td className="py-2.5 px-2 w-8">
        <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
        </button>
      </td>
      <td className="py-2.5 px-3">
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
        <td className="py-2.5 px-1">
          <InlineNumber value={item.reach} min={0} max={100} onChange={(v) => onUpdate(item.id, { reach: v })} />
        </td>
      )}
      <td className="py-2.5 px-1">
        <InlineNumber value={item.impact} min={1} max={scoringModel === 'ice' ? 10 : 3} onChange={(v) => onUpdate(item.id, { impact: v })} />
      </td>
      <td className="py-2.5 px-1">
        <InlineNumber value={item.confidence} min={1} max={scoringModel === 'ice' ? 10 : 3} onChange={(v) => onUpdate(item.id, { confidence: v })} />
      </td>
      <td className="py-2.5 px-1">
        <InlineNumber value={item.effort} min={1} max={scoringModel === 'ice' ? 10 : 5} onChange={(v) => onUpdate(item.id, { effort: v })} />
      </td>
      <td className="py-2.5 px-2">
        <span className={`score-pill ${getScoreColor(score)}`}>{score}</span>
      </td>
      <td className="py-2.5 px-2 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`badge ${statusObj.classes} cursor-pointer hover:opacity-80 transition-opacity`}
        >
          {statusObj.label}
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => { onUpdate(item.id, { status: s.value }); setShowMenu(false) }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 transition-colors ${
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
      <td className="py-2.5 px-2 w-8">
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
  const [showGuide, setShowGuide] = useState(false)
  const guide = scoringModel === 'rice' ? RICE_GUIDE : ICE_GUIDE

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
    <div>
      {/* Guide toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {showGuide ? 'Hide' : 'Show'} scoring guide
        </button>
      </div>

      {/* Expandable guide panel */}
      {showGuide && (
        <ScoringGuidePanel scoringModel={scoringModel} onClose={() => setShowGuide(false)} />
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3 px-2 w-8" />
                <th className="py-3 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Feature</th>
                {scoringModel === 'rice' && (
                  <HeaderWithHelp label="Reach" guide={guide.reach} />
                )}
                <HeaderWithHelp label="Impact" guide={guide.impact} />
                <HeaderWithHelp label="Conf." guide={guide.confidence} />
                <HeaderWithHelp
                  label={scoringModel === 'ice' ? 'Ease' : 'Effort'}
                  guide={guide.effort}
                />
                <th className="py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Score</th>
                <th className="py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Status</th>
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
    </div>
  )
}
