import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useBoards } from './hooks/useBoards'
import { useTheme } from './hooks/useTheme'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import BoardView from './pages/BoardView'

export default function App() {
  const { user, loading, signInWithEmail, signInWithGoogle, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeBoardId, setActiveBoardId] = useState(null)
  const { boards, sharedBoards, allBoards, loading: boardsLoading, createBoard, updateBoard, deleteBoard, refetch } = useBoards(user?.id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onEmailSignIn={signInWithEmail} onGoogleSignIn={signInWithGoogle} theme={theme} toggleTheme={toggleTheme} />
  }

  const activeBoard = allBoards.find(b => b.id === activeBoardId)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors">
      <Sidebar
        boards={boards}
        sharedBoards={sharedBoards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onGoHome={() => setActiveBoardId(null)}
        onSignOut={signOut}
        userEmail={user.email}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {activeBoard ? (
          <BoardView
            board={activeBoard}
            onUpdateBoard={(updates) => updateBoard(activeBoard.id, updates)}
            onDeleteBoard={() => {
              deleteBoard(activeBoard.id)
              setActiveBoardId(null)
            }}
            onBack={() => setActiveBoardId(null)}
          />
        ) : (
          <Dashboard
            boards={boards}
            loading={boardsLoading}
            onCreateBoard={createBoard}
            onSelectBoard={setActiveBoardId}
            onDeleteBoard={deleteBoard}
          />
        )}
      </main>
    </div>
  )
}
