import { useState } from 'react'
import { useItems } from '../hooks/useItems'
import ScoringTable from '../components/ScoringTable'
import ScoringGuidePanel from '../components/ScoringGuidePanel'
import MatrixView from '../components/MatrixView'
import ShareModal from '../components/ShareModal'

export default function BoardView({ board, onUpdateBoard, onDeleteBoard, onBack }) {
  const { items, loading, addItem, updateItem, deleteItem, reorderItems } = useItems(board.id)
  const [view, setView] = useState('list')
  const [showShare, setShowShare] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [boardName, setBoardName] = useState(board.name)

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addItem(newTitle.trim())
    setNewTitle('')
    setShowAddItem(false)
  }

  const handleBoardNameSave = () => {
    if (boardName.trim() && boardName.trim() !== board.name) {
      onUpdateBoard({ name: boardName.trim() })
    }
    setEditingName(false)
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {editingName ? (
            <input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleBoardNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleBoardNameSave()}
              className="text-xl font-semibold text-white bg-transparent border-b border-brand-400 outline-none pb-0.5"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-semibold text-white truncate cursor-pointer hover:text-brand-300 transition-colors"
              onClick={() => { setBoardName(board.name); setEditingName(true) }}
              title="Click to rename"
            >
              {board.name}
            </h1>
          )}
          <span className="badge bg-white/5 text-slate-400 uppercase font-mono text-[10px] tracking-wider shrink-0">
            {board.scoring_model}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Guide toggle */}
          {view === 'list' && (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`btn-ghost flex items-center gap-1.5 ${showGuide ? 'text-brand-400' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Guide
            </button>
          )}

          {/* View toggle */}
          <div className="flex bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('matrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'matrix' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Matrix
            </button>
          </div>

          <button onClick={() => setShowShare(true)} className="btn-outline flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>

          <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add item
          </button>
        </div>
      </div>

      {/* Add item form */}
      {showAddItem && (
        <div className="card p-4 mb-4">
          <form onSubmit={handleAddItem} className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Feature name, e.g. Search autocomplete"
              className="input-field flex-1"
              autoFocus
            />
            <button type="submit" className="btn-primary">Add</button>
            <button type="button" onClick={() => setShowAddItem(false)} className="btn-ghost">Cancel</button>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h2 className="text-white font-medium mb-1">No items yet</h2>
          <p className="text-slate-400 text-sm mb-4">Add your first feature to start scoring and ranking</p>
          <button onClick={() => setShowAddItem(true)} className="btn-primary">Add first item</button>
        </div>
      ) : view === 'list' ? (
        <div className={`flex gap-6 items-start ${showGuide ? '' : ''}`}>
          <div className={`min-w-0 ${showGuide ? 'flex-1' : 'w-full'}`}>
            <ScoringTable
              items={items}
              scoringModel={board.scoring_model}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onReorder={reorderItems}
            />
          </div>
          {showGuide && (
            <div className="w-80 shrink-0 hidden lg:block sticky top-6">
              <ScoringGuidePanel
                scoringModel={board.scoring_model}
                onClose={() => setShowGuide(false)}
              />
            </div>
          )}
        </div>
      ) : (
        <MatrixView items={items} />
      )}

      {showShare && (
        <ShareModal
          board={board}
          onUpdateBoard={onUpdateBoard}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
