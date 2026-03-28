import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBoards(userId) {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoards = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('boards')
      .select('*, items(count)')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setBoards(data.map(b => ({
        ...b,
        item_count: b.items?.[0]?.count || 0
      })))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  const createBoard = useCallback(async (name, scoring_model = 'rice') => {
    const { data, error } = await supabase
      .from('boards')
      .insert({ name, scoring_model, owner_id: userId })
      .select()
      .single()
    if (!error) {
      setBoards(prev => [{ ...data, item_count: 0 }, ...prev])
    }
    return { data, error }
  }, [userId])

  const updateBoard = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...data } : b))
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

  return { boards, loading, createBoard, updateBoard, deleteBoard, refetch: fetchBoards }
}
