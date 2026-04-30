import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { encryptText, decryptText } from '../lib/crypto'

async function decryptBoard(board) {
  return { ...board, name: await decryptText(board.name) }
}

export function useBoards(userId) {
  const [boards, setBoards] = useState([])
  const [sharedBoards, setSharedBoards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoards = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    // Fetch owned boards
    const { data: owned, error: ownedErr } = await supabase
      .from('boards')
      .select('*, items(count)')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (!ownedErr && owned) {
      const decrypted = await Promise.all(owned.map(decryptBoard))
      setBoards(decrypted.map(b => ({
        ...b,
        item_count: b.items?.[0]?.count || 0,
        _role: 'owner',
      })))
    }

    // Fetch boards shared with this user via collaborators table
    const { data: collabs } = await supabase
      .from('collaborators')
      .select('board_id, role')
      .eq('user_id', userId)

    if (collabs && collabs.length > 0) {
      const boardIds = collabs.map(c => c.board_id)
      const roleMap = Object.fromEntries(collabs.map(c => [c.board_id, c.role]))

      const { data: shared } = await supabase
        .from('boards')
        .select('*, items(count)')
        .in('id', boardIds)
        .order('updated_at', { ascending: false })

      if (shared) {
        const decrypted = await Promise.all(shared.map(decryptBoard))
        setSharedBoards(decrypted.map(b => ({
          ...b,
          item_count: b.items?.[0]?.count || 0,
          _role: roleMap[b.id] || 'viewer',
        })))
      }
    } else {
      setSharedBoards([])
    }

    setLoading(false)
  }, [userId])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  const createBoard = useCallback(async (name, scoring_model = 'rice') => {
    const { data, error } = await supabase
      .from('boards')
      .insert({ name: await encryptText(name), scoring_model, owner_id: userId })
      .select()
      .single()
    if (!error) {
      const decrypted = await decryptBoard(data)
      setBoards(prev => [{ ...decrypted, item_count: 0, _role: 'owner' }, ...prev])
    }
    return { data, error }
  }, [userId])

  const updateBoard = useCallback(async (id, updates) => {
    const toSave = { ...updates }
    if (toSave.name) toSave.name = await encryptText(toSave.name)
    const { data, error } = await supabase
      .from('boards')
      .update(toSave)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      const decrypted = await decryptBoard(data)
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...decrypted } : b))
      setSharedBoards(prev => prev.map(b => b.id === id ? { ...b, ...decrypted } : b))
    }
    return { data, error }
  }, [])

  const deleteBoard = useCallback(async (id) => {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)
    if (!error) {
      setBoards(prev => prev.filter(b => b.id !== id))
    }
    return { error }
  }, [])

  // All boards combined for easy lookup
  const allBoards = [...boards, ...sharedBoards]

  return { boards, sharedBoards, allBoards, loading, createBoard, updateBoard, deleteBoard, refetch: fetchBoards }
}
