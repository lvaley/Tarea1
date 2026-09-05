import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'
import './Contacto.css'

function Contacto() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <Container className="section">
      <div className="mb-5">
        <p className="eyebrow">Contacto</p>
        <h1 className="contacto-title">Contáctanos</h1>
        <p className="contacto-subtitle">
          Nos encantaría saber de ti. Escríbenos, visítanos o llámanos.
        </p>
      </div>

      <Row className="gy-5">
        <Col lg={5}>
          <ListGroup variant="flush" className="contact-info-list">
            <ListGroup.Item>
              <strong>Teléfono</strong>
              <span>+502 2300-5678</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Correo</strong>
              <span>hola@nekocoffee.com</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Dirección</strong>
              <span>Calle Sakura 123, Ciudad de Guatemala</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Horario</strong>
              <span>Lunes a Domingo, 8:00 a.m. — 9:00 p.m.</span>
            </ListGroup.Item>
          </ListGroup>

          <h2 className="contacto-faq-heading">¿Tienes dudas?</h2>
          <p className="contacto-faq-teaser">
            Consulta nuestras respuestas a las preguntas más comunes sobre
            pedidos, entregas y reservaciones.
          </p>
          <Link to="/faq" className="btn-neko-outline">
            Ver preguntas frecuentes
          </Link>
        </Col>

        <Col lg={7}>
          <Form onSubmit={handleSubmit} className="contact-form">
            <Row className="gy-3">
              <Col md={6}>
                <Form.Group controlId="contactoNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contactoEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control type="email" required />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="contactoAsunto">
                  <Form.Label>Asunto</Form.Label>
                  <Form.Select defaultValue="consulta">
                    <option value="consulta">Consulta general</option>
                    <option value="pedido">Pregunta sobre un pedido</option>
                    <option value="eventos">
                      Reservas / eventos privados
                    </option>
                    <option value="otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="contactoMensaje">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control as="textarea" rows={5} required />
                </Form.Group>
              </Col>
              <Col md={12}>
                <button type="submit" className="btn-neko">
                  Enviar mensaje
                </button>
              </Col>
            </Row>
          </Form>

          <div className="contact-map">
            <iframe
              title="Ubicación de Neko Coffee en Google Maps"
              src="https://maps.google.com/maps?q=Ciudad%20de%20Guatemala%2C%20Guatemala&z=14&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Col>
      </Row>

      <Modal show={sent} onHide={() => setSent(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mensaje enviado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Gracias por escribirnos. Te responderemos lo antes posible.
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-neko"
            onClick={() => setSent(false)}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Contacto
