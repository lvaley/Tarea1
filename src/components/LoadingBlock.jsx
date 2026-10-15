import { useEffect, useState } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import './Feedback.css'

/** Indicador de carga. Si el servidor tarda, explica por qué (el plan gratuito "duerme"). */
function LoadingBlock({ label = 'Cargando...', minHeight }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="loading-block"
      role="status"
      aria-live="polite"
      style={minHeight ? { minHeight } : undefined}
    >
      <div>
        <Spinner animation="border" size="sm" className="me-2" />
        {label}
      </div>
      {slow && (
        <p className="loading-block-slow">
          El servidor está despertando, esto puede tardar hasta un minuto la primera vez.
        </p>
      )}
    </div>
  )
}

export default LoadingBlock
