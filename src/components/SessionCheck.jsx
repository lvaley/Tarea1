import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'

/* Indicador mientras se verifica con el servidor la sesión guardada en el navegador. */
function SessionCheck() {
  return (
    <Container className="section text-center" role="status" aria-live="polite">
      <Spinner animation="border" size="sm" className="me-2" />
      Verificando tu sesión...
    </Container>
  )
}

export default SessionCheck
