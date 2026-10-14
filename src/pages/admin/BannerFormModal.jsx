import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { fieldErrorsFrom } from '../../services/api.js'
import { useBanners } from '../../context/CatalogContext.jsx'
import ImagePicker from '../../components/ImagePicker.jsx'

const URL_REGEX = /^https?:\/\/\S+$/i

const toForm = (banner) => ({
  title: banner?.title ?? '',
  text: banner?.text ?? '',
  imageKey: banner?.imageKey ?? '',
  imageUrl: banner?.imageUrl ?? '',
  order: String(banner?.order ?? 0),
  isActive: banner?.isActive ?? true,
})

function validate(form) {
  const errors = {}
  const title = form.title.trim()
  if (!title) errors.title = 'El título es obligatorio.'
  else if (title.length < 2) errors.title = 'El título debe tener al menos 2 caracteres.'
  else if (title.length > 80) errors.title = 'El título no puede superar los 80 caracteres.'

  if (form.text.trim().length > 200) errors.text = 'Máximo 200 caracteres.'

  const url = form.imageUrl.trim()
  if (url && !URL_REGEX.test(url)) errors.imageUrl = 'La URL debe empezar con http:// o https://.'
  else if (!form.imageKey && !url) errors.imageKey = 'Elige una foto de la biblioteca o indica una URL.'

  const order = Number(form.order)
  if (form.order.trim() === '' || !Number.isInteger(order) || order < 0) {
    errors.order = 'Debe ser un número entero (0 o mayor).'
  }
  return errors
}

/** Alta y edición de un banner del carrusel. `banner` es null al crear. */
function BannerFormModal({ banner, onClose, onSaved }) {
  const { create, replace } = useBanners()
  const [form, setForm] = useState(() => toForm(banner))
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const clientErrors = validate(form)
  const errorFor = (field) => (submitted ? clientErrors[field] || serverErrors[field] : undefined)

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }
  const handle = (e) => setField(e.target.name, e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(clientErrors).length > 0) return

    setSaving(true)
    setFormError(null)
    setServerErrors({})
    try {
      const payload = {
        title: form.title.trim(),
        text: form.text.trim(),
        imageKey: form.imageKey,
        imageUrl: form.imageUrl.trim(),
        order: Number(form.order),
        isActive: form.isActive,
      }
      const saved = banner ? await replace(banner.id, payload) : await create(payload)
      onSaved(`Banner «${saved.title}» ${banner ? 'actualizado' : 'creado'}.`)
    } catch (error) {
      const mapped = fieldErrorsFrom(error)
      setServerErrors(mapped)
      setFormError(Object.keys(mapped).length > 0 ? null : error.message)
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onClose} size="lg" centered scrollable animation={false}>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{banner ? `Editar «${banner.title}»` : 'Nuevo banner'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {formError && (
            <Alert variant="danger" className="py-2">
              {formError}
            </Alert>
          )}

          <Row className="gy-3">
            <Col xs={12}>
              <Form.Group controlId="bannerTitle">
                <Form.Label>Título</Form.Label>
                <Form.Control name="title" value={form.title} onChange={handle} isInvalid={!!errorFor('title')} maxLength={80} />
                <Form.Control.Feedback type="invalid">{errorFor('title')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="bannerText">
                <Form.Label>Texto</Form.Label>
                <Form.Control as="textarea" rows={2} name="text" value={form.text} onChange={handle} isInvalid={!!errorFor('text')} />
                <Form.Control.Feedback type="invalid">{errorFor('text')}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <ImagePicker
                idPrefix="banner"
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
              <Form.Group controlId="bannerOrder">
                <Form.Label>Posición en el carrusel</Form.Label>
                <Form.Control name="order" type="number" min="0" step="1" value={form.order} onChange={handle} isInvalid={!!errorFor('order')} />
                <Form.Control.Feedback type="invalid">{errorFor('order')}</Form.Control.Feedback>
                <Form.Text muted>0 aparece primero.</Form.Text>
              </Form.Group>
            </Col>
            <Col sm={6} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="bannerActive"
                label="Activo (visible en el Home)"
                checked={form.isActive}
                onChange={(e) => setField('isActive', e.target.checked)}
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

export default BannerFormModal
