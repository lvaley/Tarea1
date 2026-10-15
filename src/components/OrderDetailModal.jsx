import Modal from 'react-bootstrap/Modal'
import ListGroup from 'react-bootstrap/ListGroup'
import OrderStatusBadge from './OrderStatusBadge.jsx'
import { DELIVERY_LABELS, PAYMENT_LABELS, formatOrderDate, money } from '../data/orders.js'

/** Detalle de un pedido: productos, entrega, pago y estado. */
function OrderDetailModal({ order, onClose, onCancel }) {
  return (
    <Modal show onHide={onClose} centered scrollable animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Pedido {order.orderNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="order-detail-top">
          <OrderStatusBadge status={order.status} />
          <span className="order-detail-date">{formatOrderDate(order.createdAt)}</span>
        </div>

        <ListGroup variant="flush" className="order-detail-items">
          {order.items.map((item) => (
            <ListGroup.Item key={`${item.product}-${item.size}`}>
              <span>
                {item.qty} × {item.name}
                {item.size ? ` (${item.size})` : ''}
              </span>
              <span>{money(item.subtotal)}</span>
            </ListGroup.Item>
          ))}
          <ListGroup.Item className="order-detail-total">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </ListGroup.Item>
        </ListGroup>

        <dl className="order-detail-data">
          <dt>Entrega</dt>
          <dd>{DELIVERY_LABELS[order.delivery] ?? order.delivery}</dd>
          {order.delivery === 'domicilio' && (
            <>
              <dt>Dirección</dt>
              <dd>{order.customer.address}</dd>
            </>
          )}
          <dt>Pago</dt>
          <dd>{PAYMENT_LABELS[order.payment] ?? order.payment}</dd>
          {order.user && typeof order.user === 'object' && (
            <>
              <dt>Cuenta</dt>
              <dd>
                {order.user.name} · {order.user.email}
              </dd>
            </>
          )}
          <dt>Contacto</dt>
          <dd>
            {order.customer.name} · {order.customer.phone}
            <br />
            {order.customer.email}
          </dd>
          {order.notes && (
            <>
              <dt>Notas</dt>
              <dd>{order.notes}</dd>
            </>
          )}
        </dl>
      </Modal.Body>
      <Modal.Footer>
        {onCancel && order.status === 'pendiente' && (
          <button type="button" className="btn-danger-outline" onClick={() => onCancel(order)}>
            Cancelar pedido
          </button>
        )}
        <button type="button" className="btn-neko" onClick={onClose}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderDetailModal
