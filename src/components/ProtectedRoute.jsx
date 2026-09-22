import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Envuelve rutas que requieren sesión iniciada.
 * Si no hay sesión, redirige a /login y recuerda a dónde quería ir
 * el usuario, para devolverlo ahí después de autenticarse.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
