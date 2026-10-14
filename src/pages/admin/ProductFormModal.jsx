import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { categories } from '../../data/products.js'
import { fieldErrorsFrom } from '../../services/api.js'
import { useProducts } from '../../context/CatalogContext.jsx'
import ImagePicker from '../../components/ImagePicker.jsx'

const URL_REGEX = /^https?:\/\/\S+$/i
const LISTS = [
  ['tags', 'Etiquetas'],
  ['ingredients', 'Ingredientes'],
  ['allergens', 'Alérgenos'],
]

// "a, b, c" -> ['a', 'b', 'c']
const parseList = (text) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

function toForm(product) {
  return {
    name: product?.name ?? '',
    category: product?.category ?? categories[0].slug,
    price: product && product.sizes.length === 0 ? String(product.price) : '',
    sizes: (product?.sizes ?? []).map((size) => ({ name: size.name, price: String(size.price) })),
    shortDesc: product?.shortDesc ?? '',
    description: product?.description ?? '',
    tags: (product?.tags ?? []).join(', '),
    ingredients: (product?.ingredients ?? []).join(', '),
    allergens: (product?.allergens ?? []).join(', '),
    imageKey: product?.imageKey ?? '',
    imageUrl: product?.imageUrl ?? '',
    isAvailable: product?.isAvailable ?? true,
    isFeatured: product?.isFeatured ?? false,
  }
}

const isMoney = (value) => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0

// Misma validación que hace el servidor, para avisar antes de enviar.
function validate(form) {
  const errors = {}
  const name = form.name.trim()
  if (!name) errors.name = 'El nombre es obligatorio.'
  else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
  else if (name.length > 80) errors.name = 'El nombre no puede superar los 80 caracteres.'

  if (form.sizes.length === 0) {
    if (form.price.trim() === '') errors.price = 'El precio es obligatorio.'
    else if (!isMoney(form.price)) errors.price = 'Ingresa un precio válido (0 o mayor).'
    else if (Number(form.price) > 100000) errors.price = 'El precio es demasiado alto.'
  }
  form.sizes.forEach((size, i) => {
    if (!size.name.trim()) errors[`sizes.${i}.name`] = 'Indica el nombre del tamaño.'
    else if (size.name.trim().length > 30) errors[`sizes.${i}.name`] = 'Máximo 30 caracteres.'
    if (!isMoney(size.price)) errors[`sizes.${i}.price`] = 'Precio inválido.'
  })

  if (form.shortDesc.trim().length > 160) errors.shortDesc = 'Máximo 160 caracteres.'
  if (form.description.trim().length > 1500) errors.description = 'Máximo 1500 caracteres.'
  for (const [field] of LISTS) {
    const items = parseList(form[field])
    if (items.length > 15) errors[field] = 'Máximo 15 elementos.'
    else if (items.some((item) => item.length > 60)) errors[field] = 'Cada elemento admite máximo 60 caracteres.'
  }
  if (form.imageUrl.trim() && !URL_REGEX.test(form.imageUrl.trim())) {
    errors.imageUrl = 'La URL debe empezar con http:// o https://.'
  }
  return errors
}

function toPayload(form) {
  const hasSizes = form.sizes.length > 0
  return {
    name: form.name.trim(),
    category: form.category,
    // Con tamaños, el servidor calcula el precio base (el más barato); sin tamaños, se envía el precio.
    ...(!hasSizes && { price: Number(form.price) }),
    sizes: form.sizes.map((size) => ({ name: size.name.trim(), price: Number(size.price) })),
    shortDesc: form.shortDesc.trim(),
    description: form.description.trim(),
    tags: parseList(form.tags),
    ingredients: parseList(form.ingredients),
    allergens: parseList(form.allergens),
    imageKey: form.imageKey,
    imageUrl: form.imageUrl.trim(),
    isAvailable: form.isAvailable,
    isFeatured: form.isFeatured,
  }
}

/** Alta y edición de un producto. `product` es null al crear. */
function ProductFormModal({ product, onClose, onSaved }) {
  const { create, replace } = useProducts()
  const [form, setForm] = useState(() => toForm(product))
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const clientErrors = validate(form)
  // Error de un campo: el del cliente o el que devolvió el servidor (incluye "sizes.0.price", etc.)
  const errorFor = (field) => {
    if (!submitted) return undefined
    if (clientErrors[field]) return clientErrors[field]
    const entry = Object.entries(serverErrors).find(([key]) => key === field || key.startsWith(`${field}.`))
    return entry?.[1]
  }

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }
  const handle = (e) => setField(e.target.name, e.target.value)

  const setSize = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => (i === index ? { ...size, [key]: value } : size)),
    }))
  const addSize = () => setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { name: '', price: '' }] }))
  const removeSize = (index) =>
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))

  const minSizePrice =
    form.sizes.length > 0 && form.sizes.every((size) => isMoney(size.price))
      ? Math.min(...form.sizes.map((size) => Number(size.price)))
      : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(clientErrors).length > 0) return

    setSaving(true)
    setFormError(null)
    setServerErrors({})
    try {
      const payload = toPayload(form)
      const saved = product ? await replace(product.id, payload) : await create(payload)
      onSaved(`Producto «${saved.name}» ${product ? 'actualizado' : 'creado'}.`)
    } catch (error) {
      const mapped = {
        ...fieldErrorsFrom(error),
        ...(error.status === 409 && { name: error.message }), // nombre repetido
      }
      setServerErrors(mapped)
      setFormError(Object.keys(mapped).length > 0 ? null : error.message)
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onClose} size="lg" centered scrollable animation={false}>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{product ? `Editar «${product.name}»` : 'Nuevo producto'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {formError && (
            <Alert variant="danger" className="py-2">
              {formError}
            </Alert>
          )}

          <Row className="gy-3">
            <Col md={8}>
              <Form.Group controlId="productName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handle} isInvalid={!!errorFor('name')} maxLength={80} />
                <Form.Control.Feedback type="invalid">{errorFor('name')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="productCategory">
                <Form.Label>Categoría</Form.Label>
                <Form.Select name="category" value={form.category} onChange={handle}>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="admin-sizes-header">
                <Form.Label className="mb-0">Tamaños (opcional)</Form.Label>
                <button type="button" className="btn-neko-outline btn-sm-neko" onClick={addSize}>
                  Agregar tamaño
                </button>
              </div>

              {form.sizes.length === 0 ? (
                <Form.Group controlId="productPrice" className="mt-2">
                  <Form.Label>Precio (Q)</Form.Label>
                  <Form.Control
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handle}
                    isInvalid={!!errorFor('price')}
                  />
                  <Form.Control.Feedback type="invalid">{errorFor('price')}</Form.Control.Feedback>
                  <Form.Text muted>Si el producto tiene tamaños, agrégalos y el precio se calcula solo.</Form.Text>
                </Form.Group>
              ) : (
                <>
                  {form.sizes.map((size, index) => (
                    <Row key={index} className="gx-2 gy-1 mt-1 align-items-start">
                      <Col xs={6}>
                        <Form.Control
                          aria-label={`Nombre del tamaño ${index + 1}`}
                          placeholder="Ej. Grande"
                          value={size.name}
                          onChange={(e) => setSize(index, 'name', e.target.value)}
                          isInvalid={!!errorFor(`sizes.${index}.name`)}
                        />
                        <Form.Control.Feedback type="invalid">{errorFor(`sizes.${index}.name`)}</Form.Control.Feedback>
                      </Col>
                      <Col xs={4}>
                        <Form.Control
                          aria-label={`Precio del tamaño ${index + 1}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Precio"
                          value={size.price}
                          onChange={(e) => setSize(index, 'price', e.target.value)}
                          isInvalid={!!errorFor(`sizes.${index}.price`)}
                        />
                        <Form.Control.Feedback type="invalid">{errorFor(`sizes.${index}.price`)}</Form.Control.Feedback>
                      </Col>
                      <Col xs={2}>
                        <button
                          type="button"
                          className="remove-item-btn"
                          aria-label={`Quitar tamaño ${index + 1}`}
                          onClick={() => removeSize(index)}
                        >
                          ✕
                        </button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Text muted>
                    Precio base del producto:{' '}
                    {minSizePrice === null ? '—' : `Q${minSizePrice.toFixed(2)}`} (el tamaño más económico).
                  </Form.Text>
                </>
              )}
            </Col>

            <Col xs={12}>
              <Form.Group controlId="productShortDesc">
                <Form.Label>Descripción corta</Form.Label>
                <Form.Control name="shortDesc" value={form.shortDesc} onChange={handle} isInvalid={!!errorFor('shortDesc')} maxLength={160} />
                <Form.Control.Feedback type="invalid">{errorFor('shortDesc')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="productDescription">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handle} isInvalid={!!errorFor('description')} />
                <Form.Control.Feedback type="invalid">{errorFor('description')}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {LISTS.map(([field, label]) => (
              <Col md={4} key={field}>
                <Form.Group controlId={`product-${field}`}>
                  <Form.Label>{label}</Form.Label>
                  <Form.Control name={field} value={form[field]} onChange={handle} isInvalid={!!errorFor(field)} placeholder="Separados por comas" />
                  <Form.Control.Feedback type="invalid">{errorFor(field)}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            ))}

            <Col xs={12}>
              <ImagePicker
                idPrefix="product"
                imageKey={form.imageKey}
                imageUrl={form.imageUrl}
                error={errorFor('imageUrl') || errorFor('imageKey')}
                onChange={({ imageKey, imageUrl }) => {
                  setField('imageKey', imageKey)
                  setField('imageUrl', imageUrl)
                }}
              />
            </Col>

            <Col sm={6}>
              <Form.Check
                type="switch"
                id="productAvailable"
                label="Disponible en el menú"
                checked={form.isAvailable}
                onChange={(e) => setField('isAvailable', e.target.checked)}
              />
            </Col>
            <Col sm={6}>
              <Form.Check
                type="switch"
                id="productFeatured"
                label="Destacado en el Home"
                checked={form.isFeatured}
                onChange={(e) => setField('isFeatured', e.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn-neko-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-neko" disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ProductFormModal
