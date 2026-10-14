import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'

const PAGE_SIZE = 10

/** Pedidos de TODOS los clientes (solo administradores): filtros, búsqueda, páginas y cambio de estado. */
export function useAdminOrders() {
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 })
  const [state, setState] = useState({
    items: [],
    loading: true,
    error: null,
    total: 0,
    pages: 1,
  })
  const latest = useRef(0) // descarta respuestas que llegan fuera de orden
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const load = useCallback(async (f) => {
    const requestId = ++latest.current
    setState((s) => ({ ...s, loading: true, error: null }))
    const query = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(f.page) })
    if (f.status) query.set('status', f.status)
    if (f.search) query.set('search', f.search)
    try {
      const { data, meta } = await api.get(`/orders?${query}`)
      if (requestId !== latest.current) return
      setState({ items: data, loading: false, error: null, total: meta.total, pages: meta.pages })
    } catch (error) {
      if (requestId !== latest.current) return
      setState((s) => ({ ...s, loading: false, error: error.message }))
    }
  }, [])

  useEffect(() => {
    load(filters)
    return () => {
      latest.current += 1
    }
  }, [filters, load])

  // Al cambiar un filtro se vuelve a la primera página.
  const setStatus = useCallback((status) => setFilters((f) => (f.status === status ? f : { ...f, status, page: 1 })), [])
  const setSearch = useCallback((search) => setFilters((f) => (f.search === search ? f : { ...f, search, page: 1 })), [])
  const setPage = useCallback((page) => setFilters((f) => ({ ...f, page })), [])
  const reload = useCallback(() => load(filtersRef.current), [load])

  const changeStatus = useCallback(
    async (id, status) => {
      const { data: updated } = await api.patch(`/orders/${id}/status`, { status })
      const { status: filter } = filtersRef.current
      if (filter && updated.status !== filter) {
        // Con un filtro activo, el pedido ya no pertenece a esta lista: se vuelve a pedir la página.
        load(filtersRef.current)
      } else {
        // La respuesta no trae los datos de la cuenta; se conservan los que ya teníamos.
        setState((s) => ({
          ...s,
          items: s.items.map((o) => (o.id === updated.id ? { ...updated, user: o.user } : o)),
        }))
      }
      return updated
    },
    [load]
  )

  return { ...state, filters, setStatus, setSearch, setPage, reload, changeStatus }
}
