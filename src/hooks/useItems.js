import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { encryptText, decryptText } from '../lib/crypto'

async function decryptItem(item) {
  return { ...item, title: await decryptText(item.title) }
}

export function useItems(boardId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!boardId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('board_id', boardId)
      .order('manual_rank', { ascending: true, nullsFirst: false })
      .order('score', { ascending: false })

    if (!error && data) {
      const decrypted = await Promise.all(data.map(decryptItem))
      setItems(decrypted.sort(sortItems))
    }
    setLoading(false)
  }, [boardId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const addItem = useCallback(async (title, scoringModel = 'rice') => {
    const defaults = scoringModel === 'wsjf'
      ? { reach: 5, impact: 5, confidence: 5, effort: 5 }
      : scoringModel === 'ice'
        ? { reach: 50, impact: 5, confidence: 5, effort: 5 }
        : { reach: 50, impact: 2, confidence: 2, effort: 3 }
    const { data, error } = await supabase
      .from('items')
      .insert({
        board_id: boardId,
        title: await encryptText(title),
        ...defaults,
        status: 'backlog'
      })
      .select()
      .single()
    if (!error) {
      const decrypted = await decryptItem(data)
      setItems(prev => [...prev, decrypted].sort(sortItems))
    }
    return { data, error }
  }, [boardId])

  const updateItem = useCallback(async (id, updates) => {
    const toSave = { ...updates }
    if (toSave.title) toSave.title = await encryptText(toSave.title)
    const { data, error } = await supabase
      .from('items')
      .update(toSave)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      const decrypted = await decryptItem(data)
      setItems(prev => prev.map(i => i.id === id ? decrypted : i).sort(sortItems))
    }
    return { data, error }
  }, [])

  const deleteItem = useCallback(async (id) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
    return { error }
  }, [])

  const reorderItems = useCallback(async (reorderedItems) => {
    setItems(reorderedItems)
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      manual_rank: index + 1
    }))
    for (const u of updates) {
      await supabase
        .from('items')
        .update({ manual_rank: u.manual_rank })
        .eq('id', u.id)
    }
  }, [])

  return { items, loading, addItem, updateItem, deleteItem, reorderItems, refetch: fetchItems }
}

function sortItems(a, b) {
  if (a.manual_rank != null && b.manual_rank != null) return a.manual_rank - b.manual_rank
  if (a.manual_rank != null) return -1
  if (b.manual_rank != null) return 1
  return (b.score || 0) - (a.score || 0)
}
