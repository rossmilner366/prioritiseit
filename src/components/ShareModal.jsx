import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function ShareModal({ board, onUpdateBoard, onClose }) {
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [loadingCollabs, setLoadingCollabs] = useState(true)

  const shareUrl = `${window.location.origin}/s/${board.share_token}`

  const fetchCollaborators = useCallback(async () => {
    setLoadingCollabs(true)
    const { data, error } = await supabase
      .rpc('get_board_collaborators', { target_board_id: board.id })
    if (!error && data) {
      setCollaborators(data)
    }
    setLoadingCollabs(false)
  }, [board.id])

  useEffect(() => { fetchCollaborators() }, [fetchCollaborators])

  const handleToggleShare = async () => {
    await onUpdateBoard({ is_shared: !board.is_shared })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return

    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    // Look up user by email
    const { data: userId, error: lookupErr } = await supabase
      .rpc('get_user_id_by_email', { lookup_email: email })

    if (lookupErr || !userId) {
      setInviteError('No account found for that email. They need to sign up first.')
      setInviting(false)
      return
    }

    // Check if already a collaborator
    const existing = collaborators.find(c => c.email === email)
    if (existing) {
      setInviteError('This person already has access to this board.')
      setInviting(false)
      return
    }

    // Check if it's the owner
    if (userId === board.owner_id) {
      setInviteError("That's you — you already own this board.")
      setInviting(false)
      return
    }

    // Insert collaborator
    const { error: insertErr } = await supabase
      .from('collaborators')
      .insert({
        board_id: board.id,
        user_id: userId,
        role: inviteRole,
      })

    if (insertErr) {
      setInviteError(insertErr.message || 'Failed to invite. Please try again.')
    } else {
      setInviteSuccess(`Invited ${email} as ${inviteRole}`)
      setInviteEmail('')
      fetchCollaborators()
      setTimeout(() => setInviteSuccess(null), 3000)
    }
    setInviting(false)
  }

  const handleChangeRole = async (collabId, newRole) => {
    await supabase
      .from('collaborators')
      .update({ role: newRole })
      .eq('id', collabId)
    fetchCollaborators()
  }

  const handleRemoveCollab = async (collabId, email) => {
    if (!confirm(`Remove ${email} from this board?`)) return
    await supabase
      .from('collaborators')
      .delete()
      .eq('id', collabId)
    setCollaborators(prev => prev.filter(c => c.id !== collabId))
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
            <h2 className="text-slate-900 dark:text-white font-medium">Share &ldquo;{board.name}&rdquo;</h2>
            <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Invite by email */}
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.06]">
              <p className="text-slate-900 dark:text-white text-sm font-medium mb-1">Invite people</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-3">They&apos;ll see this board on their dashboard when they log in</p>

              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null) }}
                  placeholder="colleague@company.com"
                  className="input-field flex-1"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-field w-auto text-xs"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button type="submit" disabled={inviting} className="btn-primary shrink-0 text-sm">
                  {inviting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Invite'}
                </button>
              </form>

              {inviteError && (
                <p className="mt-2 text-red-500 dark:text-red-400 text-xs">{inviteError}</p>
              )}
              {inviteSuccess && (
                <p className="mt-2 text-emerald-600 dark:text-emerald-400 text-xs">{inviteSuccess}</p>
              )}
            </div>

            {/* Current collaborators */}
            {(collaborators.length > 0 || loadingCollabs) && (
              <div className="p-5 border-b border-slate-100 dark:border-white/[0.06]">
                <p className="text-slate-900 dark:text-white text-sm font-medium mb-3">
                  People with access
                </p>

                {loadingCollabs ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Owner row */}
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-400/15 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-medium shrink-0">
                        O
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">You</p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">Owner</span>
                    </div>

                    {collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center gap-3 py-1.5 group">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-medium shrink-0">
                          {collab.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{collab.email}</p>
                        </div>
                        <select
                          value={collab.role}
                          onChange={(e) => handleChangeRole(collab.id, e.target.value)}
                          className="text-xs bg-transparent border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-400/40"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRemoveCollab(collab.id, collab.email)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                          title="Remove access"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Public link */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium">Public read-only link</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Anyone with the link — no login needed</p>
                </div>
                <button
                  onClick={handleToggleShare}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    board.is_shared ? 'bg-brand-400' : 'bg-slate-200 dark:bg-white/10'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    board.is_shared ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {board.is_shared && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="input-field flex-1 text-xs font-mono"
                      onClick={(e) => e.target.select()}
                    />
                    <button onClick={handleCopy} className="btn-primary shrink-0 text-xs">
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
