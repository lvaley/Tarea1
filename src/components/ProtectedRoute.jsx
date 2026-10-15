import { Link, Navigate, useLocation } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { useAuth } from '../context/AuthContext.jsx'
import SessionCheck from './SessionCheck.jsx'

/**
 * Envuelve rutas que requieren sesión iniciada (y, opcionalmente, un rol: roles={['admin']}).
 * - Mientras se verifica con el servidor la sesión guardada, muestra un indicador de carga
 *   (así no se expulsa al usuario al login por error al recargar la página).
 * - Si no hay sesión, redirige a /login y recuerda a dónde quería ir.
 * - Si hay sesión pero el rol no corresponde, explica que no tiene permiso.
 *   (La API también lo impide: esto solo evita mostrar una pantalla que no podría usar.)
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()

  if (isInitializing) return <SessionCheck />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="section text-center">
        <p className="eyebrow">Acceso restringido</p>
        <h1>No tienes permiso para ver esta página</h1>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
          Esta sección es solo para administradores.
        </p>
        <Link to="/" className="btn-neko">
          Volver al inicio
        </Link>
      </Container>
    )
  }

  return children
}

export default ProtectedRoute
