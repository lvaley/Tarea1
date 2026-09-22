import { useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import Table from 'react-bootstrap/Table'
import { useAuth } from '../context/AuthContext.jsx'
import './Perfil.css'

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('es-GT', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function formatShortDate(isoDate) {
  if (!isoDate) return '—'
  // Se fuerza a mediodía UTC para evitar corrimientos de día por zona horaria.
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('es-GT', {
    dateStyle: 'medium',
  })
}

function Perfil() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const orders = user.orders || []
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <Container className="section">
      <div className="mb-4">
        <p className="eyebrow">Mi cuenta</p>
        <h1 className="perfil-title">Hola, {user.name.split(' ')[0]}</h1>
        <p className="perfil-subtitle">
          Aquí puedes revisar los datos de tu sesión y tus pedidos anteriores.
        </p>
      </div>

      <Row className="gy-4">
        {/* Columna izquierda: datos de la sesión */}
        <Col lg={5}>
          <Card className="perfil-card">
            <Card.Body>
              <div className="perfil-identity">
                <span className="perfil-avatar">{getInitials(user.name)}</span>
                <div>
                  <h2 className="perfil-name">{user.name}</h2>
                  <Badge bg="" className="tag-badge">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <ListGroup variant="flush" className="perfil-data-list">
                <ListGroup.Item>
                  <span className="perfil-data-label">Correo</span>
                  <span className="perfil-data-value">{user.email}</span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className="perfil-data-label">Tipo de membresía</span>
                  <span className="perfil-data-value">{user.role}</span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className="perfil-data-label">Inicio de sesión</span>
                  <span className="perfil-data-value">
                    {formatDate(user.loginDate)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className="perfil-data-label">Pedidos realizados</span>
                  <span className="perfil-data-value">{orders.length}</span>
                </ListGroup.Item>
              </ListGroup>

              <button
                type="button"
                className="btn-neko-outline w-100 mt-4"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha: historial de pedidos simulado */}
        <Col lg={7}>
          <Card className="perfil-card h-100">
            <Card.Body>
              <div className="perfil-orders-header">
                <h2 className="perfil-section-title">Historial de pedidos</h2>
                {orders.length > 0 && (
                  <span className="perfil-total-spent">
                    Total acumulado: <strong>Q{totalSpent.toFixed(2)}</strong>
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <p className="perfil-empty">
                  Todavía no tienes pedidos registrados.
                </p>
              ) : (
                <Table responsive hover className="perfil-table align-middle">
                  <thead>
                    <tr>
                      <th>No. de pedido</th>
                      <th>Fecha</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="perfil-order-id">{order.id}</td>
                        <td>{formatShortDate(order.date)}</td>
                        <td className="text-end perfil-order-total">
                          Q{order.total.toFixed(2)}
                        </td>
                        <td className="text-end">
                          <Badge bg="" className="tag-badge">
                            Entregado
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              <p className="perfil-note">
                Los pedidos mostrados son datos simulados con fines
                demostrativos, ya que el proyecto no cuenta con backend.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Perfil
