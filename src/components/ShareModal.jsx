import { useState } from 'react'

export default function ShareModal({ board, onUpdateBoard, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/s/${board.share_token}`

  const handleToggleShare = async () => {
    await onUpdateBoard({ is_shared: !board.is_shared })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/[0.06]">
            <h2 className="text-slate-900 dark:text-white font-medium">Share board</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-900 dark:text-white text-sm font-medium">Public read-only link</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Anyone with the link can view this board</p>
              </div>
              <button
                onClick={handleToggleShare}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  board.is_shared ? 'bg-brand-400' : 'bg-white/10'
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
                <div className="bg-brand-400/5 border border-brand-400/10 rounded-lg p-3">
                  <p className="text-brand-300 text-xs">
                    Stakeholders can view the ranked list and matrix without creating an account.
                    You can revoke access at any time by toggling the switch off.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
