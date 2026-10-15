import Badge from 'react-bootstrap/Badge'
import { STATUS_LABELS } from '../data/orders.js'
import './OrderStatusBadge.css'

function OrderStatusBadge({ status }) {
  return (
    <Badge bg="" className={`status-badge status-${status}`}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export default OrderStatusBadge
