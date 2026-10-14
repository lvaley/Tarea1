import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import SessionCheck from '../components/SessionCheck.jsx'
import { DELIVERY_LABELS, money } from '../data/orders.js'
import './Checkout.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/

// Misma validación que hace el servidor, para avisar antes de enviar.
function validate(values, delivery) {
  const errors = {}
  const name = values.name.trim()
  if (!name) errors.name = 'El nombre es obligatorio.'
  else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
  else if (name.length > 80) errors.name = 'El nombre no puede superar los 80 caracteres.'

  if (!values.phone.trim()) errors.phone = 'El teléfono es obligatorio.'
  else if (!PHONE_REGEX.test(values.phone.trim())) errors.phone = 'Ingresa un teléfono válido (solo números, +, - y paréntesis).'

  if (!values.email.trim()) errors.email = 'El correo es obligatorio.'
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Ingresa un correo válido.'

  const address = values.address.trim()
  if (delivery === 'domicilio' && address.length < 5) {
    errors.address = 'La dirección es obligatoria para entrega a domicilio (mínimo 5 caracteres).'
  } else if (address.length > 200) {
    errors.address = 'La dirección admite máximo 200 caracteres.'
  }
  if (values.notes.trim().length > 200) errors.notes = 'Las notas admiten máximo 200 caracteres.'
  return errors
}

/* Los productos del carrito: cantidades, quitar y, si el servidor rechazó alguno, el motivo. */
function CartLines({ items, updateQty, removeItem, itemErrors }) {
  return (
    <div className="cart-item-list">
      {items.map((item) => (
        <div className="cart-item-row" key={item.key}>
          <img src={item.image} alt={item.name} className="cart-item-img" />
          <div className="cart-item-info">
            <span className="cart-item-name">
              {item.name}
              {item.sizeName ? ` (${item.sizeName})` : ''}
            </span>
            <span className="cart-item-unit-price">{money(item.price)} c/u</span>
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
          <div className="cart-item-line-total">{money(item.qty * item.price)}</div>
          <button
            type="button"
            className="remove-item-btn"
            onClick={() => removeItem(item.key)}
            aria-label={`Quitar ${item.name}`}
          >
            ✕
          </button>
          {itemErrors[item.key] && (
            <p className="cart-item-error" role="alert">
              {itemErrors[item.key]}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function SummaryList({ items, total }) {
  return (
    <>
      <ul className="summary-list">
        {items.map((item) => (
          <li key={item.key}>
            <span>
              {item.qty} × {item.name}
              {item.sizeName ? ` (${item.sizeName})` : ''}
            </span>
            <span>{money(item.qty * item.price)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-total">
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
    </>
  )
}

function Checkout() {
  const { items, updateQty, removeItem, total, clearCart } = useCart()
  const { user, isAuthenticated, isInitializing, notice } = useAuth()

  // Lo que el usuario ha escrito; mientras no escriba, se usan los datos de su cuenta.
  const [edited, setEdited] = useState({})
  const [delivery, setDelivery] = useState('recoger')
  const [payment, setPayment] = useState('efectivo')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [itemErrors, setItemErrors] = useState({}) // por clave de producto del carrito
  const [formError, setFormError] = useState(null)
  const [createdOrder, setCreatedOrder] = useState(null)

  const defaults = { name: user?.name ?? '', email: user?.email ?? '', phone: '', address: '', notes: '' }
  const values = { ...defaults, ...edited }

  const clientErrors = validate(values, delivery)
  const errorFor = (field) => (submitted ? clientErrors[field] || serverErrors[field] : undefined)

  const handleChange = (e) => {
    const { name, value } = e.target
    setEdited((prev) => ({ ...prev, [name]: value }))
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0 || submitting) return
    setSubmitted(true)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    setFormError(null)
    setServerErrors({})
    setItemErrors({})
    const expectedTotal = total
    const sent = items // el orden del envío es el que usa el servidor para indicar qué línea falló

    try {
      // Solo se envía qué producto, tamaño y cantidad: nombres, precios y total los calcula el servidor.
      const { data } = await api.post('/orders', {
        items: sent.map((item) => ({ productId: item.id, size: item.sizeName ?? '', qty: item.qty })),
        customer: {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
        },
        delivery,
        payment,
        notes: values.notes.trim(),
      })
      setCreatedOrder({ ...data, priceChanged: Math.abs(data.total - expectedTotal) > 0.001 })
      clearCart()
      setEdited((prev) => ({ ...prev, notes: '' }))
      setSubmitted(false)
    } catch (error) {
      const fields = {}
      const lines = {}
      for (const detail of error.details ?? []) {
        const line = /^items\[(\d+)\]\.?(\w*)/.exec(detail.field)
        if (line) {
          const key = sent[Number(line[1])]?.key
          if (key && !lines[key]) {
            lines[key] =
              line[2] === 'productId'
                ? 'Este producto ya no está disponible. Quítalo para continuar.'
                : detail.message
          }
        } else {
          const field = detail.field.replace(/^customer\./, '')
          if (!fields[field]) fields[field] = detail.message
        }
      }
      setServerErrors(fields)
      setItemErrors(lines)
      // Si hay productos marcados, el aviso se deduce de ellos (desaparece al quitarlos);
      // si no hay errores por campo, es un error general (sin conexión, sesión vencida, etc.).
      if (Object.keys(lines).length === 0 && Object.keys(fields).length === 0) {
        setFormError(error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const header = (
    <div className="mb-5">
      <p className="eyebrow">Pedido</p>
      <h1 className="checkout-title">Tu pedido</h1>
      <p className="checkout-subtitle">
        Estos son los productos que has elegido desde el menú. El pago se realiza al recibir tu
        pedido o por transferencia: este sitio no procesa pagos en línea.
      </p>
    </div>
  )

  let content
  if (isInitializing) {
    content = <SessionCheck />
  } else if (items.length === 0) {
    content = (
      <div className="empty-cart">
        <p>Todavía no has agregado productos a tu pedido.</p>
        <Link to="/menu" className="btn-neko">
          Ir al menú
        </Link>
      </div>
    )
  } else if (!isAuthenticated) {
    // Los pedidos pertenecen a una cuenta: así se puede consultar su estado y el historial.
    content = (
      <Row className="gy-4">
        <Col lg={7}>
          <h2 className="checkout-section-heading">Productos elegidos</h2>
          <CartLines items={items} updateQty={updateQty} removeItem={removeItem} itemErrors={{}} />
        </Col>
        <Col lg={5}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Resumen del pedido</Card.Title>
              <SummaryList items={items} total={total} />
              {notice && (
                <Alert variant="warning" className="py-2 mt-3 mb-0">
                  {notice}
                </Alert>
              )}
              <p className="checkout-guest-note">
                Para confirmar tu pedido necesitas una cuenta: así podrás seguir su estado y ver tu
                historial.
              </p>
              <Link to="/login" state={{ from: '/checkout' }} className="btn-neko d-block text-center w-100">
                Inicia sesión para confirmar
              </Link>
              <Link to="/register" state={{ from: '/checkout' }} className="add-more-link">
                ¿No tienes cuenta? Crear cuenta
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  } else {
    content = (
      <Form noValidate onSubmit={handleSubmit}>
        {formError && (
          <Alert variant="danger" className="py-2">
            {formError}
          </Alert>
        )}
        {items.some((item) => itemErrors[item.key]) && (
          <Alert variant="danger" className="py-2">
            Revisa los productos marcados en tu pedido antes de continuar.
          </Alert>
        )}
        <Row className="gy-4">
          <Col lg={7}>
            <h2 className="checkout-section-heading">Productos elegidos</h2>
            <CartLines items={items} updateQty={updateQty} removeItem={removeItem} itemErrors={itemErrors} />

            <h2 className="checkout-section-heading mt-4">Datos del cliente</h2>
            <Row className="gy-3">
              <Col md={6}>
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control name="name" value={values.name} onChange={handleChange} isInvalid={!!errorFor('name')} autoComplete="name" />
                  <Form.Control.Feedback type="invalid">{errorFor('name')}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="telefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control name="phone" type="tel" value={values.phone} onChange={handleChange} isInvalid={!!errorFor('phone')} autoComplete="tel" />
                  <Form.Control.Feedback type="invalid">{errorFor('phone')}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control name="email" type="email" value={values.email} onChange={handleChange} isInvalid={!!errorFor('email')} autoComplete="email" />
                  <Form.Control.Feedback type="invalid">{errorFor('email')}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="direccion">
                  <Form.Label>
                    Dirección de entrega{delivery === 'domicilio' ? '' : ' (solo para entrega a domicilio)'}
                  </Form.Label>
                  <Form.Control as="textarea" rows={2} name="address" value={values.address} onChange={handleChange} isInvalid={!!errorFor('address')} />
                  <Form.Control.Feedback type="invalid">{errorFor('address')}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="notas">
                  <Form.Label>Notas para tu pedido (opcional)</Form.Label>
                  <Form.Control as="textarea" rows={2} name="notes" value={values.notes} onChange={handleChange} isInvalid={!!errorFor('notes')} placeholder="Ej. sin azúcar, alergias, indicaciones de entrega" />
                  <Form.Control.Feedback type="invalid">{errorFor('notes')}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="gy-4 mt-1">
              <Col md={6}>
                <h2 className="checkout-section-heading">Entrega</h2>
                <Form.Check type="radio" name="entrega" id="recoger" label={DELIVERY_LABELS.recoger} checked={delivery === 'recoger'} onChange={() => setDelivery('recoger')} />
                <Form.Check type="radio" name="entrega" id="domicilio" label={DELIVERY_LABELS.domicilio} checked={delivery === 'domicilio'} onChange={() => setDelivery('domicilio')} />
              </Col>
              <Col md={6}>
                <h2 className="checkout-section-heading">Pago</h2>
                <Form.Check type="radio" name="pago" id="efectivo" label="Efectivo al recibir" checked={payment === 'efectivo'} onChange={() => setPayment('efectivo')} />
                <Form.Check type="radio" name="pago" id="tarjeta" label="Tarjeta al recibir" checked={payment === 'tarjeta'} onChange={() => setPayment('tarjeta')} />
                <Form.Check type="radio" name="pago" id="transferencia" label="Transferencia bancaria" checked={payment === 'transferencia'} onChange={() => setPayment('transferencia')} />
              </Col>
            </Row>
          </Col>

          <Col lg={5}>
            <Card className="summary-card">
              <Card.Body>
                <Card.Title>Resumen del pedido</Card.Title>
                <SummaryList items={items} total={total} />
                <button type="submit" className="btn-neko w-100 mt-3" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Enviando pedido...
                    </>
                  ) : (
                    'Confirmar pedido'
                  )}
                </button>
                <Link to="/menu" className="add-more-link">
                  + Agregar más productos
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <Container className="section">
      {header}
      {content}

      <Modal show={createdOrder !== null} onHide={() => setCreatedOrder(null)} centered>
        {createdOrder && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>¡Pedido confirmado!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Gracias por tu pedido en Neko Coffee. Quedó registrado como{' '}
                <strong>pendiente</strong>; puedes seguir su estado en tu perfil.
              </p>
              <div className="order-number-box">
                <span>Número de pedido</span>
                <strong>{createdOrder.orderNumber}</strong>
              </div>
              <p className="mb-0 mt-3">
                <strong>Total del pedido:</strong> {money(createdOrder.total)}
              </p>
              <p className="mb-0">
                <strong>Entrega:</strong> {DELIVERY_LABELS[createdOrder.delivery]}
              </p>
              {createdOrder.priceChanged && (
                <Alert variant="warning" className="py-2 mt-3 mb-0">
                  Algunos precios cambiaron desde que agregaste los productos: el total mostrado es el
                  vigente.
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Link to="/perfil" className="btn-neko-outline" onClick={() => setCreatedOrder(null)}>
                Ver mis pedidos
              </Link>
              <button type="button" className="btn-neko" onClick={() => setCreatedOrder(null)}>
                Cerrar
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  )
}

export default Checkout
