import { useState } from 'react'

export default function Sidebar({ boards, activeBoardId, onSelectBoard, onGoHome, onSignOut, userEmail }) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="w-14 bg-slate-950 border-r border-white/[0.06] flex flex-col items-center py-4 gap-3 shrink-0">
        <button onClick={() => setCollapsed(false)} className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </button>
        <div className="w-6 h-px bg-white/10 my-1" />
        <button onClick={onGoHome} className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors" title="Dashboard">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </button>
        {boards.slice(0, 5).map(b => (
          <button
            key={b.id}
            onClick={() => onSelectBoard(b.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
              activeBoardId === b.id ? 'bg-brand-400/15 text-brand-400' : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'
            }`}
            title={b.name}
          >
            {b.name.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="w-60 bg-slate-950 border-r border-white/[0.06] flex flex-col shrink-0">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="font-semibold text-white text-sm">PrioritiseIt</span>
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      <div className="px-3 mb-1">
        <button
          onClick={onGoHome}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
            !activeBoardId ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          All boards
        </button>
      </div>

      <div className="px-4 mt-4 mb-1.5">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Boards</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {boards.map(b => (
          <button
            key={b.id}
            onClick={() => onSelectBoard(b.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
              activeBoardId === b.id
                ? 'bg-brand-400/10 text-brand-400'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="truncate">{b.name}</span>
            {b.is_shared && (
              <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" title="Shared" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-400/15 flex items-center justify-center text-brand-400 text-xs font-medium shrink-0">
            {userEmail?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-400 truncate flex-1">{userEmail}</span>
          <button onClick={onSignOut} className="text-slate-500 hover:text-slate-300 transition-colors" title="Sign out">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
