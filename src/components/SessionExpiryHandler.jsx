import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useAuth } from '../context/AuthContext.jsx'
import { SESSION_EXPIRED_MESSAGE } from '../utils/session.js'

/**
 * Manejo global de la sesión caducada. Se monta una sola vez, dentro del Router y del
 * AuthProvider, así funciona desde CUALQUIER página (pública o protegida).
 *
 * Cuando el AuthContext cierra la sesión por caducidad del token (temporizador o 401):
 *   1. muestra un Toast visible: "Su sesión ya no es válida o ha caducado",
 *   2. redirige a /login con useNavigate (recordando la página donde estaba).
 */
function SessionExpiryHandler() {
  const { sessionExpired, acknowledgeExpiry } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const redirected = useRef(false)

  // Redirige una sola vez por cada caducidad (el Toast sigue visible mientras sessionExpired sea true).
  useEffect(() => {
    if (!sessionExpired) {
      redirected.current = false
      return
    }
    if (redirected.current) return
    redirected.current = true
    const from = pathname === '/login' || pathname === '/register' ? undefined : pathname
    navigate('/login', { replace: true, state: { expired: true, from } })
  }, [sessionExpired, pathname, navigate])

  return (
    <ToastContainer position="top-center" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
      <Toast bg="danger" show={sessionExpired} onClose={acknowledgeExpiry} delay={9000} autohide>
        <Toast.Header closeButton>
          <strong className="me-auto">Sesión caducada</strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {SESSION_EXPIRED_MESSAGE}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default SessionExpiryHandler
