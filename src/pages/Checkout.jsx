import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import { useCart } from '../context/CartContext.jsx'
import './Checkout.css'

function generateOrderNumber() {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `NEKO-${random}`
}

function Checkout() {
  const { items, updateQty, removeItem, total, clearCart } = useCart()
  const [delivery, setDelivery] = useState('recoger')
  const [payment, setPayment] = useState('efectivo')
  const [orderNumber, setOrderNumber] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (items.length === 0) return
    setOrderNumber(generateOrderNumber())
  }

  const handleCloseConfirmation = () => {
    setOrderNumber(null)
    clearCart()
  }

  return (
    <Container className="section">
      <div className="mb-5">
        <p className="eyebrow">Pedido</p>
        <h1 className="checkout-title">Tu pedido</h1>
        <p className="checkout-subtitle">
          Estos son los productos que has elegido desde el menú. Este
          formulario es una demostración, no procesa pagos reales.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Todavía no has agregado productos a tu pedido.</p>
          <Link to="/menu" className="btn-neko">
            Ir al menú
          </Link>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row className="gy-4">
            <Col lg={7}>
              <h2 className="checkout-section-heading">
                Productos elegidos
              </h2>
              <div className="cart-item-list">
                {items.map((item) => (
                  <div className="cart-item-row" key={item.key}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <span className="cart-item-name">
                        {item.name}
                        {item.sizeName ? ` (${item.sizeName})` : ''}
                      </span>
                      <span className="cart-item-unit-price">
                        Q{item.price.toFixed(2)} c/u
                      </span>
                    </div>
                    <div className="cart-item-qty-control">
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, item.qty - 1)}
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-line-total">
                      Q{(item.qty * item.price).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Quitar ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <h2 className="checkout-section-heading mt-4">
                Datos del cliente
              </h2>
              <Row className="gy-3">
                <Col md={6}>
                  <Form.Group controlId="nombre">
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control type="text" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="telefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control type="tel" required />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="email">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control type="email" required />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="direccion">
                    <Form.Label>Dirección de entrega</Form.Label>
                    <Form.Control as="textarea" rows={2} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="gy-4 mt-1">
                <Col md={6}>
                  <h2 className="checkout-section-heading">Entrega</h2>
                  <Form.Check
                    type="radio"
                    name="entrega"
                    id="recoger"
                    label="Recoger en tienda"
                    checked={delivery === 'recoger'}
                    onChange={() => setDelivery('recoger')}
                  />
                  <Form.Check
                    type="radio"
                    name="entrega"
                    id="domicilio"
                    label="Entrega a domicilio"
                    checked={delivery === 'domicilio'}
                    onChange={() => setDelivery('domicilio')}
                  />
                </Col>
                <Col md={6}>
                  <h2 className="checkout-section-heading">Pago</h2>
                  <Form.Check
                    type="radio"
                    name="pago"
                    id="efectivo"
                    label="Efectivo al recibir"
                    checked={payment === 'efectivo'}
                    onChange={() => setPayment('efectivo')}
                  />
                  <Form.Check
                    type="radio"
                    name="pago"
                    id="tarjeta"
                    label="Tarjeta al recibir"
                    checked={payment === 'tarjeta'}
                    onChange={() => setPayment('tarjeta')}
                  />
                  <Form.Check
                    type="radio"
                    name="pago"
                    id="transferencia"
                    label="Transferencia bancaria"
                    checked={payment === 'transferencia'}
                    onChange={() => setPayment('transferencia')}
                  />
                </Col>
              </Row>
            </Col>

            <Col lg={5}>
              <Card className="summary-card">
                <Card.Body>
                  <Card.Title>Resumen del pedido</Card.Title>
                  <ul className="summary-list">
                    {items.map((item) => (
                      <li key={item.key}>
                        <span>
                          {item.qty} × {item.name}
                          {item.sizeName ? ` (${item.sizeName})` : ''}
                        </span>
                        <span>Q{(item.qty * item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>Q{total.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="btn-neko w-100 mt-3">
                    Confirmar pedido
                  </button>
                  <Link to="/menu" className="add-more-link">
                    + Agregar más productos
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      )}

      <Modal show={orderNumber !== null} onHide={handleCloseConfirmation} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Pedido confirmado!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Gracias por tu pedido en Neko Coffee. Esta pantalla es una
            demostración: al no contar con un backend real, generamos un
            número de pedido de referencia únicamente para fines de
            demostración.
          </p>
          <div className="order-number-box">
            <span>Número de pedido</span>
            <strong>{orderNumber}</strong>
          </div>
          <p className="mb-0 mt-3">
            <strong>Total del pedido:</strong> Q{total.toFixed(2)}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-neko"
            onClick={handleCloseConfirmation}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Checkout
