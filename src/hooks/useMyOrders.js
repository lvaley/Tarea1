import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'

const PAGE_SIZE = 10
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

const initialState = {
  items: [],
  status: 'loading', // loading | success | error
  error: null,
  total: 0, // cantidad de pedidos
  totalSpent: 0, // total acumulado (sin contar cancelados), lo calcula el servidor
  page: 0,
  pages: 1,
  loadingMore: false,
}

/** Historial de pedidos del usuario autenticado: carga por páginas y permite cancelar. */
export function useMyOrders() {
  const [state, setState] = useState(initialState)
  const latest = useRef(0) // descarta respuestas que llegan fuera de orden

  const fetchPage = useCallback(async (page, append) => {
    const requestId = ++latest.current
    setState((s) =>
      append
        ? { ...s, loadingMore: true, error: null }
        : { ...s, status: s.items.length ? s.status : 'loading', error: null }
    )
    try {
      const { data, meta } = await api.get(`/orders/me?limit=${PAGE_SIZE}&page=${page}`)
      if (requestId !== latest.current) return
      setState((s) => ({
        items: append ? [...s.items, ...data] : data,
        status: 'success',
        error: null,
        total: meta.total,
        totalSpent: meta.totalSpent,
        page: meta.page,
        pages: meta.pages,
        loadingMore: false,
      }))
    } catch (error) {
      if (requestId !== latest.current) return
      setState((s) => ({
        ...s,
        status: s.items.length ? 'success' : 'error',
        error: error.message,
        loadingMore: false,
      }))
    }
  }, [])

  useEffect(() => {
    fetchPage(1, false)
    return () => {
      latest.current += 1
    }
  }, [fetchPage])

  const reload = useCallback(() => fetchPage(1, false), [fetchPage])
  const loadMore = useCallback(() => fetchPage(state.page + 1, true), [fetchPage, state.page])

  // Cancela un pedido pendiente; la respuesta del servidor reemplaza al pedido en la lista.
  const cancel = useCallback(async (id) => {
    const { data: updated } = await api.patch(`/orders/${id}/cancel`)
    setState((s) => ({
      ...s,
      items: s.items.map((order) => (order.id === updated.id ? updated : order)),
      totalSpent: Math.max(0, round2(s.totalSpent - updated.total)),
    }))
    return updated
  }, [])

  return { ...state, reload, loadMore, cancel }
}
