import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { api, fieldErrorsFrom, setAuthToken, setUnauthorizedHandler } from '../services/api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'neko_token'
const SESSION_EXPIRED = 'Tu sesión expiró. Inicia sesión de nuevo.'
const SESSION_UNVERIFIED = 'No se pudo verificar tu sesión porque el servidor no responde. Inténtalo de nuevo.'

// El token se guarda en localStorage para conservar la sesión al recargar la página.
// (Si el navegador bloquea el almacenamiento, la sesión simplemente dura mientras la pestaña esté abierta.)
function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // almacenamiento no disponible
  }
}

const loggedOut = {
  isAuthenticated: false,
  user: null, // { id, name, email, role, membership, lastLogin, createdAt }
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'error'
  error: null, // mensaje del último intento de login/registro fallido
  notice: null, // aviso informativo (ej. "Tu sesión expiró")
}

function createInitialState() {
  const token = readStoredToken()
  // Si hay un token guardado, hay que verificarlo con el servidor antes de decidir
  // si el usuario está autenticado: mientras tanto, isInitializing es true.
  return { ...loggedOut, token, isInitializing: Boolean(token) }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, status: 'loading', error: null, notice: null }

    case 'LOGIN_SUCCESS':
      return {
        ...loggedOut,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isInitializing: false,
      }

    case 'LOGIN_FAILURE':
      return { ...state, isAuthenticated: false, user: null, status: 'error', error: action.payload }

    case 'LOGOUT':
      return { ...loggedOut, isInitializing: false }

    // La sesión guardada en el navegador sigue siendo válida
    case 'SESSION_RESTORED':
      return { ...state, isAuthenticated: true, user: action.payload, isInitializing: false }

    // No se pudo recuperar la sesión (token vencido o servidor inalcanzable)
    case 'SESSION_INVALID':
      return { ...loggedOut, notice: action.payload, isInitializing: false }

    case 'CLEAR_ERROR':
      return state.status === 'error' ? { ...state, status: 'idle', error: null } : state

    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, createInitialState)

  // Se ejecuta si el servidor rechaza el token en cualquier petición (sesión vencida).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null)
      writeStoredToken(null)
      dispatch({ type: 'SESSION_INVALID', payload: SESSION_EXPIRED })
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Al cargar la app: si había un token guardado, se valida con GET /auth/me.
  useEffect(() => {
    const token = readStoredToken()
    setAuthToken(token) // el AuthProvider es la fuente de verdad: sin token guardado, no queda ninguno
    if (!token) return undefined

    let cancelled = false
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) dispatch({ type: 'SESSION_RESTORED', payload: data.user })
      })
      .catch((error) => {
        // Un 401 ya lo atiende el manejador global; aquí solo falta el caso "servidor inalcanzable".
        if (!cancelled && error.status !== 401) {
          dispatch({ type: 'SESSION_INVALID', payload: SESSION_UNVERIFIED })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startSession = useCallback(({ user, token }) => {
    setAuthToken(token)
    writeStoredToken(token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
  }, [])

  // Login y registro comparten el mismo flujo: pedir al servidor, guardar la sesión o mostrar el error.
  const authenticate = useCallback(
    async (path, body) => {
      dispatch({ type: 'LOGIN_REQUEST' })
      try {
        const { data } = await api.post(path, body)
        startSession(data)
        return { ok: true }
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
        return {
          ok: false,
          error: error.message,
          status: error.status,
          fieldErrors: fieldErrorsFrom(error),
        }
      }
    },
    [startSession]
  )

  const login = useCallback(
    ({ email, password }) => authenticate('/auth/login', { email, password }),
    [authenticate]
  )

  // Solo se envían estos tres campos: el rol siempre lo decide el servidor.
  const register = useCallback(
    ({ name, email, password }) => authenticate('/auth/register', { name, email, password }),
    [authenticate]
  )

  const logout = useCallback(() => {
    setAuthToken(null)
    writeStoredToken(null)
    dispatch({ type: 'LOGOUT' })
  }, [])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  const value = useMemo(
    () => ({ ...state, login, register, logout, clearError }),
    [state, login, register, logout, clearError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  }
  return context
}
