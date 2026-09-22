import { createContext, useCallback, useContext, useReducer } from 'react'

const AuthContext = createContext(null)

/**
 * "Base de datos" simulada de usuarios, ya que el proyecto no tiene backend.
 * El login compara las credenciales ingresadas contra este arreglo.
 * Las contraseñas en texto plano son solo para esta demostración académica;
 * nunca se haría así en un proyecto real.
 */
const MOCK_USERS = [
  {
    email: 'luis@nekocoffee.com',
    password: '12345678',
    name: 'Luis Valey',
    role: 'Administrador',
    orders: [
      { id: 'NEKO-482913', date: '2026-08-02', total: 74.0 },
      { id: 'NEKO-119284', date: '2026-08-20', total: 32.0 },
    ],
  },
  {
    email: 'cliente@nekocoffee.com',
    password: '12345678',
    name: 'Sora Kimura',
    role: 'Cliente frecuente',
    orders: [{ id: 'NEKO-773410', date: '2026-09-01', total: 48.0 }],
  },
]

const initialState = {
  isAuthenticated: false,
  user: null, // { name, email, role, loginDate, orders }
  status: 'idle', // 'idle' | 'loading' | 'error'
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, status: 'loading', error: null }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        status: 'idle',
        error: null,
      }

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        status: 'error',
        error: action.payload,
      }

    case 'LOGOUT':
      return initialState

    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Simula una llamada asíncrona a un servidor de autenticación.
  const login = useCallback(({ email, password }) => {
    dispatch({ type: 'LOGIN_REQUEST' })

    return new Promise((resolve) => {
      setTimeout(() => {
        const found = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        )

        if (!found || found.password !== password) {
          dispatch({
            type: 'LOGIN_FAILURE',
            payload: 'Correo o contraseña incorrectos.',
          })
          resolve({ ok: false })
          return
        }

        const user = {
          name: found.name,
          email: found.email,
          role: found.role,
          loginDate: new Date().toISOString(),
          orders: found.orders,
        }

        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        resolve({ ok: true })
      }, 600)
    })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const value = { ...state, login, logout }

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
