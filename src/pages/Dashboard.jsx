import { useState } from 'react'

export default function Dashboard({ boards, loading, onCreateBoard, onSelectBoard, onDeleteBoard }) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newModel, setNewModel] = useState('rice')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data } = await onCreateBoard(newName.trim(), newModel)
    if (data) {
      onSelectBoard(data.id)
      setNewName('')
      setShowCreate(false)
    }
    setCreating(false)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Your boards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{boards.length} board{boards.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New board
        </button>
      </div>

      {showCreate && (
        <div className="card p-5 mb-6">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Board name, e.g. Q2 Roadmap"
              className="input-field flex-1"
              autoFocus
            />
            <select
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="input-field w-auto sm:w-32"
            >
              <option value="rice">RICE</option>
              <option value="ice">ICE</option>
              <option value="wsjf">WSJF</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h2 className="text-slate-900 dark:text-white font-medium mb-1">No boards yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Create your first board to start prioritising features</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create your first board</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boards.map(b => (
            <div
              key={b.id}
              onClick={() => onSelectBoard(b.id)}
              className="card-hover p-4 group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate pr-4">{b.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${b.name}"? This cannot be undone.`)) {
                      onDeleteBoard(b.id)
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{b.item_count} item{b.item_count !== 1 ? 's' : ''}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="uppercase font-mono text-[10px] tracking-wider">{b.scoring_model}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>{formatTime(b.updated_at)}</span>
              </div>
              {b.is_shared && (
                <div className="mt-2.5">
                  <span className="badge bg-brand-400/10 text-brand-400">Shared</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
