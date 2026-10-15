import { useMemo, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { categories } from '../../data/products.js'
import { useProducts } from '../../context/CatalogContext.jsx'
import LoadingBlock from '../../components/LoadingBlock.jsx'
import ErrorBlock from '../../components/ErrorBlock.jsx'
import ProductFormModal from './ProductFormModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug

function AdminProducts() {
  const { items, status, error, reload, patch, remove } = useProducts()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined: cerrado · null: nuevo · objeto: editar
  const [deleting, setDeleting] = useState(null)
  const [deleteState, setDeleteState] = useState({ busy: false, error: null })
  const [busyKey, setBusyKey] = useState(null) // interruptor que se está guardando
  const [notice, setNotice] = useState(null) // { variant, text }

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase()
    return items.filter(
      (p) => (!category || p.category === category) && (!text || p.name.toLowerCase().includes(text))
    )
  }, [items, search, category])

  const toggle = async (product, field) => {
    setBusyKey(`${product.id}:${field}`)
    setNotice(null)
    try {
      await patch(product.id, { [field]: !product[field] })
    } catch (err) {
      setNotice({ variant: 'danger', text: `No se pudo actualizar «${product.name}»: ${err.message}` })
    } finally {
      setBusyKey(null)
    }
  }

  const confirmDelete = async () => {
    setDeleteState({ busy: true, error: null })
    try {
      await remove(deleting.id)
      setNotice({ variant: 'success', text: `Producto «${deleting.name}» eliminado.` })
      setDeleting(null)
      setDeleteState({ busy: false, error: null })
    } catch (err) {
      setDeleteState({ busy: false, error: err.message })
    }
  }

  return (
    <section aria-label="Administración de productos">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <Form.Control
            type="search"
            aria-label="Buscar producto"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Form.Select aria-label="Filtrar por categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </div>
        <button type="button" className="btn-neko" onClick={() => setEditing(null)}>
          Nuevo producto
        </button>
      </div>

      {notice && (
        <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)} className="py-2">
          {notice.text}
        </Alert>
      )}

      {status === 'error' && <ErrorBlock message={error} onRetry={reload} />}
      {(status === 'idle' || status === 'loading') && <LoadingBlock label="Cargando productos..." />}

      {status === 'success' && (
        <>
          <p className="admin-count">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </p>
          <Table responsive hover className="admin-table align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th className="text-center">Disponible</th>
                <th className="text-center">Destacado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-row-name">
                      <img src={product.image} alt="" />
                      <div>
                        <strong>{product.name}</strong>
                        {product.isAvailable === false && (
                          <Badge bg="" className="tag-badge ms-2">
                            Oculto
                          </Badge>
                        )}
                        <div className="admin-row-sub">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{categoryName(product.category)}</td>
                  <td className="admin-price">
                    {product.sizes.length > 1 ? 'Desde ' : ''}Q{product.price.toFixed(2)}
                  </td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      className="admin-switch"
                      id={`avail-${product.id}`}
                      aria-label={`Disponible: ${product.name}`}
                      checked={product.isAvailable !== false}
                      disabled={busyKey === `${product.id}:isAvailable`}
                      onChange={() => toggle(product, 'isAvailable')}
                    />
                  </td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      className="admin-switch"
                      id={`feat-${product.id}`}
                      aria-label={`Destacado: ${product.name}`}
                      checked={!!product.isFeatured}
                      disabled={busyKey === `${product.id}:isFeatured`}
                      onChange={() => toggle(product, 'isFeatured')}
                    />
                  </td>
                  <td className="text-end admin-actions">
                    <button
                      type="button"
                      className="btn-neko-outline btn-sm-neko"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => setEditing(product)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger-outline btn-sm-neko"
                      aria-label={`Eliminar ${product.name}`}
                      onClick={() => {
                        setDeleteState({ busy: false, error: null })
                        setDeleting(product)
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No hay productos que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}

      {editing !== undefined && (
        <ProductFormModal
          key={editing?.id ?? 'new'}
          product={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(text) => {
            setNotice({ variant: 'success', text })
            setEditing(undefined)
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Eliminar producto"
          busy={deleteState.busy}
          error={deleteState.error}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        >
          <p className="mb-2">
            ¿Eliminar <strong>«{deleting.name}»</strong> del menú? Esta acción no se puede deshacer.
          </p>
          <p className="mb-0 text-muted small">
            Los pedidos anteriores conservan su información. Si solo quieres retirarlo temporalmente,
            desactiva «Disponible».
          </p>
        </ConfirmModal>
      )}
    </section>
  )
}

export default AdminProducts
