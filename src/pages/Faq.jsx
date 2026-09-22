import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Accordion from 'react-bootstrap/Accordion'
import './Faq.css'

const faqGroups = [
  {
    heading: 'Pedidos y pagos',
    items: [
      {
        q: '¿Cómo hago un pedido?',
        a: 'Elige tus productos desde el Menú (puedes usar "Vista rápida" o entrar a la ficha de cada producto) y pulsa "Comprar". Los productos se van agregando a tu pedido, que puedes revisar y confirmar en la página de Pedido.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Efectivo al recibir, tarjeta al recibir o transferencia bancaria. Puedes elegir el método al confirmar tu pedido.',
      },
      {
        q: '¿Puedo modificar mi pedido después de confirmarlo?',
        a: 'Este sitio es una demostración y no procesa pedidos reales. En una versión con backend, podrías modificar o cancelar un pedido contactando directamente a la cafetería.',
      },
    ],
  },
  {
    heading: 'Entregas y horario',
    items: [
      {
        q: '¿Hacen entregas a domicilio?',
        a: 'Sí, entregamos en toda la ciudad. Puedes elegir esta opción al hacer tu pedido en la página de Pedido.',
      },
      {
        q: '¿Cuál es el horario de atención?',
        a: 'Estamos abiertos todos los días de 8:00 a.m. a 9:00 p.m.',
      },
      {
        q: '¿Puedo recoger mi pedido en tienda?',
        a: 'Sí, "Recoger en tienda" está disponible como opción de entrega al momento de confirmar tu pedido.',
      },
    ],
  },
  {
    heading: 'La cafetería y los productos',
    items: [
      {
        q: '¿Puedo llevar a mi mascota?',
        a: 'Neko Coffee es un cat café con gatos residentes, por lo que no permitimos otras mascotas dentro del local.',
      },
      {
        q: '¿Tienen opciones sin gluten o veganas?',
        a: 'Sí, varias bebidas y postres cuentan con esta opción. Puedes verlas marcadas con una etiqueta en cada categoría del menú.',
      },
      {
        q: '¿Aceptan reservaciones para grupos?',
        a: 'Sí, escríbenos por WhatsApp o correo con al menos 24 horas de anticipación para coordinar tu visita.',
      },
    ],
  },
]

function Faq() {
  return (
    <Container className="section">
      <div className="text-center mb-5">
        <p className="eyebrow">Ayuda</p>
        <h1 className="faq-title">Preguntas frecuentes</h1>
        <p className="faq-subtitle">
          Todo lo que necesitas saber sobre pedidos, entregas y tu visita a
          Neko Coffee.
        </p>
      </div>

      <Row className="justify-content-center">
        <Col lg={9}>
          {faqGroups.map((group) => (
            <div key={group.heading} className="faq-group">
              <h2 className="faq-group-heading">{group.heading}</h2>
              <Accordion className="faq-accordion" alwaysOpen={false}>
                {group.items.map((item, index) => (
                  <Accordion.Item
                    eventKey={`${group.heading}-${index}`}
                    key={item.q}
                  >
                    <Accordion.Header>{item.q}</Accordion.Header>
                    <Accordion.Body>{item.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="faq-cta">
            <h3>¿No encontraste tu respuesta?</h3>
            <p>Escríbenos y con gusto te ayudamos.</p>
            <Link to="/contacto" className="btn-neko">
              Quiero contactarme
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Faq
