import Modal from 'react-bootstrap/Modal'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

/**
 * Confirmación antes de una acción que no se puede deshacer (eliminar un producto, cancelar un pedido...).
 * El texto de los botones se personaliza con cancelLabel, confirmLabel y busyLabel.
 */
function ConfirmModal({
  title,
  children,
  busy,
  error,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Eliminar',
  busyLabel = 'Eliminando...',
  onCancel,
  onConfirm,
}) {
  return (
    <Modal show onHide={busy ? undefined : onCancel} centered animation={false}>
      <Modal.Header closeButton={!busy}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}
        {children}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn-neko-outline" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className="btn-danger-neko" onClick={onConfirm} disabled={busy}>
          {busy ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              {busyLabel}
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
