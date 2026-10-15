import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { useAdminOrders } from '../../hooks/useAdminOrders.js'
import {
  DELIVERY_LABELS,
  NEXT_STATUSES,
  STATUS_LABELS,
  formatOrderDate,
  money,
} from '../../data/orders.js'
import LoadingBlock from '../../components/LoadingBlock.jsx'
import ErrorBlock from '../../components/ErrorBlock.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx'
import OrderDetailModal from '../../components/OrderDetailModal.jsx'

function AdminOrders() {
  const orders = useAdminOrders()
  const { setSearch } = orders

  const [searchText, setSearchText] = useState('')
  const [viewing, setViewing] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [cancelState, setCancelState] = useState({ busy: false, error: null })
  const [busyId, setBusyId] = useState(null) // pedido cuyo estado se está guardando
  const [notice, setNotice] = useState(null) // { variant, text }

  // La búsqueda espera un instante a que termines de escribir para no consultar en cada tecla.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400)
    return () => clearTimeout(timer)
  }, [searchText, setSearch])

  const announce = (order, status) =>
    setNotice({ variant: 'success', text: `Pedido ${order.orderNumber} pasó a «${STATUS_LABELS[status]}».` })

  const applyStatus = async (order, status) => {
    setBusyId(order.id)
    setNotice(null)
    try {
      await orders.changeStatus(order.id, status)
      announce(order, status)
    } catch (error) {
      // Lo más común: otro cambio (del cliente o de otro admin) llegó primero. Se muestra el motivo
      // y se actualiza la lista para ver el estado real.
      setNotice({ variant: 'danger', text: error.message })
      orders.reload()
    } finally {
      setBusyId(null)
    }
  }

  const requestChange = (order, status) => {
    if (!status) return
    if (status === 'cancelado') {
      setCancelState({ busy: false, error: null })
      setCancelling(order)
    } else {
      applyStatus(order, status)
    }
  }

  const confirmCancel = async () => {
    setCancelState({ busy: true, error: null })
    try {
      await orders.changeStatus(cancelling.id, 'cancelado')
      announce(cancelling, 'cancelado')
      setCancelling(null)
    } catch (error) {
      setCancelState({ busy: false, error: error.message })
      orders.reload()
    }
  }

  const hasFilters = Boolean(orders.filters.status || orders.filters.search)

  return (
    <section aria-label="Administración de pedidos">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <Form.Control
            type="search"
            aria-label="Buscar pedido"
            placeholder="Número, cliente o correo..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Form.Select
            aria-label="Filtrar por estado"
            value={orders.filters.status}
            onChange={(e) => orders.setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Form.Select>
        </div>
        <button type="button" className="btn-neko-outline" onClick={orders.reload} disabled={orders.loading}>
          Actualizar
        </button>
      </div>

      {notice && (
        <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)} className="py-2">
          {notice.text}
        </Alert>
      )}

      {orders.error && <ErrorBlock message={orders.error} onRetry={orders.reload} />}
      {orders.loading && orders.items.length === 0 && !orders.error && (
        <LoadingBlock label="Cargando pedidos..." />
      )}

      {!orders.error && (!orders.loading || orders.items.length > 0) && (
        <>
          <p className="admin-count">
            {orders.total} {orders.total === 1 ? 'pedido' : 'pedidos'}
          </p>
          <Table responsive hover className="admin-table align-middle">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Entrega</th>
                <th className="text-end">Total</th>
                <th className="text-center">Estado</th>
                <th>Cambiar estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => {
                const next = NEXT_STATUSES[order.status] ?? []
                return (
                  <tr key={order.id}>
                    <td>
                      <strong className="admin-order-number">{order.orderNumber}</strong>
                      <div className="admin-row-sub">{formatOrderDate(order.createdAt)}</div>
                    </td>
                    <td>
                      <div>{order.customer.name}</div>
                      <div className="admin-row-sub">{order.customer.email}</div>
                    </td>
                    <td>{DELIVERY_LABELS[order.delivery] ?? order.delivery}</td>
                    <td className="text-end admin-price">{money(order.total)}</td>
                    <td className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>
                      {next.length === 0 ? (
                        <span className="admin-final">Sin cambios posibles</span>
                      ) : (
                        <Form.Select
                          size="sm"
                          className="admin-status-select"
                          aria-label={`Cambiar estado de ${order.orderNumber}`}
                          value=""
                          disabled={busyId === order.id}
                          onChange={(e) => requestChange(order, e.target.value)}
                        >
                          <option value="">Cambiar a...</option>
                          {next.map((status) => (
                            <option key={status} value={status}>
                              {status === 'cancelado' ? 'Cancelar pedido' : STATUS_LABELS[status]}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </td>
                    <td className="text-end admin-actions">
                      <button
                        type="button"
                        className="btn-neko-outline btn-sm-neko"
                        aria-label={`Ver pedido ${order.orderNumber}`}
                        onClick={() => setViewing(order)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
              {orders.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    {hasFilters ? 'No hay pedidos que coincidan.' : 'Todavía no hay pedidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {orders.pages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="btn-neko-outline btn-sm-neko"
                onClick={() => orders.setPage(orders.filters.page - 1)}
                disabled={orders.filters.page <= 1 || orders.loading}
              >
                Anterior
              </button>
              <span>
                Página {orders.filters.page} de {orders.pages}
              </span>
              <button
                type="button"
                className="btn-neko-outline btn-sm-neko"
                onClick={() => orders.setPage(orders.filters.page + 1)}
                disabled={orders.filters.page >= orders.pages || orders.loading}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {viewing && <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />}

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
            ¿Cancelar el pedido <strong>{cancelling.orderNumber}</strong> de{' '}
            <strong>{cancelling.customer.name}</strong> por <strong>{money(cancelling.total)}</strong>? El
            cliente lo verá como cancelado y esta acción no se puede deshacer.
          </p>
        </ConfirmModal>
      )}
    </section>
  )
}

export default AdminOrders
