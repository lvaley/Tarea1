import Form from 'react-bootstrap/Form'
import { imageOptions, resolveImage } from '../data/images.js'

/**
 * Selector de imagen del panel: una lista desplegable con las fotos del proyecto y,
 * opcionalmente, una URL externa. Si se indica una URL, tiene prioridad sobre la foto.
 */
function ImagePicker({ idPrefix, imageKey, imageUrl, onChange, error }) {
  const preview = resolveImage({ imageKey, imageUrl })

  return (
    <div className="image-picker">
      <img src={preview} alt="Vista previa de la imagen" className="image-picker-preview" />

      <div className="image-picker-fields">
        <Form.Group className="mb-2" controlId={`${idPrefix}Key`}>
          <Form.Label>Foto de la biblioteca</Form.Label>
          <Form.Select
            value={imageKey}
            onChange={(e) => onChange({ imageKey: e.target.value, imageUrl })}
          >
            <option value="">— Ninguna —</option>
            {imageOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId={`${idPrefix}Url`}>
          <Form.Label>O una URL de imagen (opcional)</Form.Label>
          <Form.Control
            type="text"
            value={imageUrl}
            onChange={(e) => onChange({ imageKey, imageUrl: e.target.value })}
            isInvalid={!!error}
            placeholder="https://..."
            maxLength={500}
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          <Form.Text muted>Si indicas una URL, se usa en lugar de la foto de la biblioteca.</Form.Text>
        </Form.Group>
      </div>
    </div>
  )
}

export default ImagePicker
