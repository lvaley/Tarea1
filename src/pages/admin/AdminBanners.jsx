import { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { useBanners } from '../../context/CatalogContext.jsx'
import LoadingBlock from '../../components/LoadingBlock.jsx'
import ErrorBlock from '../../components/ErrorBlock.jsx'
import BannerFormModal from './BannerFormModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

function AdminBanners() {
  const { items, status, error, reload, patch, remove } = useBanners()

  const [editing, setEditing] = useState(undefined) // undefined: cerrado · null: nuevo · objeto: editar
  const [deleting, setDeleting] = useState(null)
  const [deleteState, setDeleteState] = useState({ busy: false, error: null })
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const toggleActive = async (banner) => {
    setBusyId(banner.id)
    setNotice(null)
    try {
      await patch(banner.id, { isActive: !banner.isActive })
    } catch (err) {
      setNotice({ variant: 'danger', text: `No se pudo actualizar «${banner.title}»: ${err.message}` })
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    setDeleteState({ busy: true, error: null })
    try {
      await remove(deleting.id)
      setNotice({ variant: 'success', text: `Banner «${deleting.title}» eliminado.` })
      setDeleting(null)
      setDeleteState({ busy: false, error: null })
    } catch (err) {
      setDeleteState({ busy: false, error: err.message })
    }
  }

  return (
    <section aria-label="Administración de banners">
      <div className="admin-toolbar">
        <p className="admin-hint">
          Los banners activos aparecen en el carrusel del Home, ordenados por su posición.
        </p>
        <button type="button" className="btn-neko" onClick={() => setEditing(null)}>
          Nuevo banner
        </button>
      </div>

      {notice && (
        <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)} className="py-2">
          {notice.text}
        </Alert>
      )}

      {status === 'error' && <ErrorBlock message={error} onRetry={reload} />}
      {(status === 'idle' || status === 'loading') && <LoadingBlock label="Cargando banners..." />}

      {status === 'success' && (
        <Table responsive hover className="admin-table align-middle">
          <thead>
            <tr>
              <th>Banner</th>
              <th className="text-center">Posición</th>
              <th className="text-center">Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((banner) => (
              <tr key={banner.id}>
                <td>
                  <div className="admin-row-name">
                    <img src={banner.image} alt="" className="admin-banner-thumb" />
                    <div>
                      <strong>{banner.title}</strong>
                      {!banner.isActive && (
                        <Badge bg="" className="tag-badge ms-2">
                          Inactivo
                        </Badge>
                      )}
                      <div className="admin-row-sub">{banner.text}</div>
                    </div>
                  </div>
                </td>
                <td className="text-center">{banner.order}</td>
                <td className="text-center">
                  <Form.Check
                    type="switch"
                    className="admin-switch"
                    id={`banner-active-${banner.id}`}
                    aria-label={`Activo: ${banner.title}`}
                    checked={banner.isActive}
                    disabled={busyId === banner.id}
                    onChange={() => toggleActive(banner)}
                  />
                </td>
                <td className="text-end admin-actions">
                  <button
                    type="button"
                    className="btn-neko-outline btn-sm-neko"
                    aria-label={`Editar ${banner.title}`}
                    onClick={() => setEditing(banner)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger-outline btn-sm-neko"
                    aria-label={`Eliminar ${banner.title}`}
                    onClick={() => {
                      setDeleteState({ busy: false, error: null })
                      setDeleting(banner)
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty">
                  Todavía no hay banners. Crea el primero con «Nuevo banner».
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {editing !== undefined && (
        <BannerFormModal
          key={editing?.id ?? 'new'}
          banner={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(text) => {
            setNotice({ variant: 'success', text })
            setEditing(undefined)
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Eliminar banner"
          busy={deleteState.busy}
          error={deleteState.error}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        >
          <p className="mb-0">
            ¿Eliminar el banner <strong>«{deleting.title}»</strong>? Esta acción no se puede deshacer.
          </p>
        </ConfirmModal>
      )}
    </section>
  )
}

export default AdminBanners
