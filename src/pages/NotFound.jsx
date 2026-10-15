import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'

function NotFound() {
  return (
    <Container className="section text-center">
      <p className="eyebrow">Error 404</p>
      <h1>Página no encontrada</h1>
      <p style={{ color: 'var(--text-muted)', margin: '16px 0 28px' }}>
        La página que buscas no existe o fue movida.
      </p>
      <Link to="/" className="btn-neko">
        Volver al inicio
      </Link>
    </Container>
  )
}

export default NotFound
