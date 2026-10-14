import Alert from 'react-bootstrap/Alert'
import './Feedback.css'

/** Error de carga con botón para reintentar. */
function ErrorBlock({ message, onRetry }) {
  return (
    <Alert variant="danger" className="error-block">
      <span>{message || 'No se pudo cargar la información.'}</span>
      {onRetry && (
        <button type="button" className="btn-neko-outline btn-sm-neko" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </Alert>
  )
}

export default ErrorBlock
