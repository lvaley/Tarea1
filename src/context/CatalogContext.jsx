import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { api } from '../services/api.js'
import { resolveImage } from '../data/images.js'
import { useAuth } from './AuthContext.jsx'

/**
 * Estado global del catálogo: productos y banners del Home.
 * Una sola fuente de datos para todo el sitio: cuando el panel de administración crea, edita
 * o elimina algo, la respuesta del servidor actualiza este estado y el Menú, la ficha del
 * producto y el Home se actualizan al instante, sin recargar.
 */
const CatalogContext = createContext(null)

const emptyResource = { items: [], status: 'idle', error: null } // status: idle | loading | success | error
const initialState = { products: emptyResource, banners: emptyResource }

// Mismo orden que usa la API, para que un elemento nuevo quede en su lugar sin recargar.
const SORTERS = {
  products: (a, b) =>
    a.category.localeCompare(b.category) || String(a.createdAt).localeCompare(String(b.createdAt)),
  banners: (a, b) => a.order - b.order || String(a.createdAt).localeCompare(String(b.createdAt)),
}

// La API devuelve imageKey/imageUrl; "image" es la imagen ya resuelta que usan los componentes.
const normalizeProduct = (p) => ({
  ...p,
  tags: p.tags ?? [],
  ingredients: p.ingredients ?? [],
  allergens: p.allergens ?? [],
  sizes: p.sizes ?? [],
  image: resolveImage(p),
})
const normalizeBanner = (b) => ({ ...b, image: resolveImage(b) })
const NORMALIZERS = { products: normalizeProduct, banners: normalizeBanner }

function catalogReducer(state, action) {
  const { resource } = action
  const current = state[resource]
  const set = (patch) => ({ ...state, [resource]: { ...current, ...patch } })

  switch (action.type) {
    // Si ya hay datos (recarga manual), se conservan mientras llegan los nuevos.
    case 'REQUEST':
      return set({ status: current.items.length ? current.status : 'loading', error: null })
    case 'SUCCESS':
      return set({ items: action.items, status: 'success', error: null })
    case 'FAILURE':
      return set({ status: current.items.length ? 'success' : 'error', error: action.error })
    case 'RESET':
      return { ...state, [resource]: emptyResource }
    // Crear o actualizar: la respuesta del servidor entra al estado.
    case 'UPSERT': {
      const exists = current.items.some((item) => item.id === action.item.id)
      const items = exists
        ? current.items.map((item) => (item.id === action.item.id ? action.item : item))
        : [...current.items, action.item]
      return set({ items: items.sort(SORTERS[resource]), status: 'success' })
    }
    case 'REMOVE':
      return set({ items: current.items.filter((item) => item.id !== action.id) })
    default:
      return state
  }
}

// El API pagina (máx. 100 por página): se piden todas las páginas.
async function fetchAllProducts() {
  const all = []
  let page = 1
  let pages
  do {
    const { data, meta } = await api.get(`/recursos?limit=100&page=${page}`)
    all.push(...data)
    pages = meta.pages
    page += 1
  } while (page <= pages)
  return all
}

const fetchBanners = async () => (await api.get('/banners')).data

export function CatalogProvider({ children }) {
  const { user, isInitializing } = useAuth()
  const [state, dispatch] = useReducer(catalogReducer, initialState)
  const latest = useRef({ products: 0, banners: 0 }) // descarta respuestas que llegan fuera de orden

  const load = useCallback(async (resource) => {
    const requestId = ++latest.current[resource]
    dispatch({ type: 'REQUEST', resource })
    try {
      const raw = resource === 'products' ? await fetchAllProducts() : await fetchBanners()
      if (requestId === latest.current[resource]) {
        dispatch({ type: 'SUCCESS', resource, items: raw.map(NORMALIZERS[resource]) })
      }
    } catch (error) {
      if (requestId === latest.current[resource]) {
        dispatch({ type: 'FAILURE', resource, error: error.message })
      }
    }
  }, [])

  // El contenido depende de quién mira: un administrador también recibe los elementos ocultos.
  // Se espera a que termine de verificarse la sesión y, al cambiar de usuario (login/logout),
  // se vacía y se vuelve a pedir, para no dejar a la vista datos de otra sesión.
  const viewer = isInitializing ? null : `${user?.id ?? 'guest'}:${user?.role ?? ''}`
  useEffect(() => {
    if (viewer === null) return
    for (const resource of ['products', 'banners']) {
      dispatch({ type: 'RESET', resource })
      load(resource)
    }
  }, [viewer, load])

  // --- Escritura (solo administradores): el servidor valida y su respuesta actualiza el estado ---
  const save = useCallback(async (resource, path, method, data) => {
    const { data: saved } = await api[method](path, data)
    const item = NORMALIZERS[resource](saved)
    dispatch({ type: 'UPSERT', resource, item })
    return item
  }, [])

  const remove = useCallback(async (resource, path, id) => {
    await api.delete(`${path}/${id}`)
    dispatch({ type: 'REMOVE', resource, id })
  }, [])

  const value = useMemo(() => {
    const { products, banners } = state
    const visibleProducts = products.items.filter((p) => p.isAvailable !== false)
    return {
      products: {
        ...products,
        visible: visibleProducts,
        featured: visibleProducts.filter((p) => p.isFeatured),
        reload: () => load('products'),
        find: (ref) => products.items.find((p) => p.id === ref || p.slug === ref),
        create: (data) => save('products', '/recursos', 'post', data),
        replace: (id, data) => save('products', `/recursos/${id}`, 'put', data),
        patch: (id, data) => save('products', `/recursos/${id}`, 'patch', data),
        remove: (id) => remove('products', '/recursos', id),
      },
      banners: {
        ...banners,
        visible: banners.items.filter((b) => b.isActive !== false),
        reload: () => load('banners'),
        create: (data) => save('banners', '/banners', 'post', data),
        replace: (id, data) => save('banners', `/banners/${id}`, 'put', data),
        patch: (id, data) => save('banners', `/banners/${id}`, 'patch', data),
        remove: (id) => remove('banners', '/banners', id),
      },
    }
  }, [state, load, save, remove])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('Los hooks del catálogo deben usarse dentro de un <CatalogProvider>')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => useCatalog().products
// eslint-disable-next-line react-refresh/only-export-components
export const useBanners = () => useCatalog().banners
