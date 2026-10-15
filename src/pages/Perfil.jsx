import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import Table from 'react-bootstrap/Table'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../context/AuthContext.jsx'
import { useMyOrders } from '../hooks/useMyOrders.js'
import { formatOrderDate, money } from '../data/orders.js'
import LoadingBlock from '../components/LoadingBlock.jsx'
import ErrorBlock from '../components/ErrorBlock.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import OrderDetailModal from '../components/OrderDetailModal.jsx'
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

function Perfil() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const orders = useMyOrders()

  const [viewing, setViewing] = useState(null) // pedido cuyo detalle se muestra
  const [cancelling, setCancelling] = useState(null) // pedido que se va a cancelar
  const [cancelState, setCancelState] = useState({ busy: false, error: null })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const askCancel = (order) => {
    setViewing(null)
    setCancelState({ busy: false, error: null })
    setCancelling(order)
  }

  const confirmCancel = async () => {
    setCancelState({ busy: true, error: null })
    try {
      await orders.cancel(cancelling.id)
      setCancelling(null)
    } catch (error) {
      setCancelState({ busy: false, error: error.message })
    }
  }

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
                    {user.membership}
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
                  <span className="perfil-data-value">{user.membership}</span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className="perfil-data-label">Último acceso</span>
                  <span className="perfil-data-value">
                    {formatDate(user.lastLogin || user.createdAt)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className="perfil-data-label">Pedidos realizados</span>
                  <span className="perfil-data-value">
                    {orders.status === 'success' ? orders.total : '—'}
                  </span>
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

        {/* Columna derecha: historial real de pedidos */}
        <Col lg={7}>
          <Card className="perfil-card h-100">
            <Card.Body>
              <div className="perfil-orders-header">
                <h2 className="perfil-section-title">Historial de pedidos</h2>
                {orders.status === 'success' && orders.total > 0 && (
                  <span className="perfil-total-spent">
                    Total acumulado: <strong>{money(orders.totalSpent)}</strong>
                  </span>
                )}
              </div>

              {orders.status === 'loading' && <LoadingBlock label="Cargando tus pedidos..." />}
              {orders.error && <ErrorBlock message={orders.error} onRetry={orders.reload} />}

              {orders.status === 'success' && orders.items.length === 0 && (
                <p className="perfil-empty">
                  Todavía no tienes pedidos registrados.{' '}
                  <Link to="/menu">Ir al menú</Link>
                </p>
              )}

              {orders.items.length > 0 && (
                <>
                  <Table responsive hover className="perfil-table align-middle">
                    <thead>
                      <tr>
                        <th>No. de pedido</th>
                        <th>Fecha</th>
                        <th className="text-end">Total</th>
                        <th className="text-center">Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.items.map((order) => (
                        <tr key={order.id}>
                          <td className="perfil-order-id">{order.orderNumber}</td>
                          <td className="perfil-order-date">{formatOrderDate(order.createdAt)}</td>
                          <td className="text-end perfil-order-total">{money(order.total)}</td>
                          <td className="text-center">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="text-end perfil-order-actions">
                            <button
                              type="button"
                              className="btn-neko-outline btn-sm-neko"
                              aria-label={`Ver pedido ${order.orderNumber}`}
                              onClick={() => setViewing(order)}
                            >
                              Ver
                            </button>
                            {order.status === 'pendiente' && (
                              <button
                                type="button"
                                className="btn-danger-outline btn-sm-neko"
                                aria-label={`Cancelar pedido ${order.orderNumber}`}
                                onClick={() => askCancel(order)}
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="perfil-orders-footer">
                    <button type="button" className="btn-link-neko" onClick={orders.reload}>
                      Actualizar
                    </button>
                    {orders.page < orders.pages && (
                      <button
                        type="button"
                        className="btn-neko-outline btn-sm-neko"
                        onClick={orders.loadMore}
                        disabled={orders.loadingMore}
                      >
                        {orders.loadingMore ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Cargando...
                          </>
                        ) : (
                          'Cargar más'
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {viewing && (
        <OrderDetailModal order={viewing} onClose={() => setViewing(null)} onCancel={askCancel} />
      )}

      {cancelling && (
        <ConfirmModal
          title="Cancelar pedido"
          cancelLabel="Volver"
          confirmLabel="Cancelar pedido"
          busyLabel="Cancelando..."
          busy={cancelState.busy}
          error={cancelState.error}
          onCancel={() => setCancelling(null)}
          onConfirm={confirmCancel}
        >
          <p className="mb-0">
            ¿Cancelar el pedido <strong>{cancelling.orderNumber}</strong> por{' '}
            <strong>{money(cancelling.total)}</strong>? Esta acción no se puede deshacer.
          </p>
        </ConfirmModal>
      )}
    </Container>
  )
}

export default Perfil
