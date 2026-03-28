import { useState } from 'react'
import { LogoMark, LogoFull } from './Logo'

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

export default function Sidebar({ boards, sharedBoards, activeBoardId, onSelectBoard, onGoHome, onSignOut, userEmail, theme, toggleTheme }) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="w-14 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/[0.06] flex flex-col items-center py-4 gap-3 shrink-0 transition-colors">
        <button onClick={() => setCollapsed(false)} className="shrink-0">
          <LogoMark size={36} />
        </button>
        <div className="w-6 h-px bg-slate-200 dark:bg-white/10 my-1" />
        <button onClick={onGoHome} className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title="Dashboard">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </button>
        {boards.slice(0, 5).map(b => (
          <button
            key={b.id}
            onClick={() => onSelectBoard(b.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
              activeBoardId === b.id ? 'bg-brand-100 dark:bg-brand-400/15 text-brand-600 dark:text-brand-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
    <div className="w-60 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/[0.06] flex flex-col shrink-0 transition-colors">
      <div className="p-4 flex items-center gap-3">
        <LogoMark size={32} className="shrink-0" />
        <span className="font-bold text-slate-900 dark:text-white text-sm">Prioritise<span className="text-brand-400">It</span></span>
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      <div className="px-3 mb-1">
        <button
          onClick={onGoHome}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
            !activeBoardId
              ? 'bg-slate-100 dark:bg-white/[0.06] text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          All boards
        </button>
      </div>

      <div className="px-4 mt-4 mb-1.5">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your boards</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {boards.map(b => (
          <button
            key={b.id}
            onClick={() => onSelectBoard(b.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
              activeBoardId === b.id
                ? 'bg-brand-50 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="truncate">{b.name}</span>
            {b.is_shared && (
              <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" title="Shared" />
            )}
          </button>
        ))}

        {sharedBoards && sharedBoards.length > 0 && (
          <>
            <div className="px-1 pt-3 pb-1">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shared with you</span>
            </div>
            {sharedBoards.map(b => (
              <button
                key={b.id}
                onClick={() => onSelectBoard(b.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                  activeBoardId === b.id
                    ? 'bg-brand-50 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate">{b.name}</span>
                <span className="ml-auto shrink-0 text-[10px] font-mono text-slate-400 dark:text-slate-600 capitalize">{b._role}</span>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-white/[0.06] space-y-0.5">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-400/15 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-medium shrink-0">
            {userEmail?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{userEmail}</span>
          <button onClick={onSignOut} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Sign out">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
