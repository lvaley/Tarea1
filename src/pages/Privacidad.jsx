import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './Legal.css'

function Privacidad() {
  return (
    <Container className="section">
      <div className="mb-5">
        <p className="eyebrow">Legal</p>
        <h1 className="legal-title">Política de privacidad</h1>
        <p className="legal-updated">Última actualización: septiembre 2026</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={9}>
          <div className="legal-content">
            <section>
              <h2>1. Información que recopilamos</h2>
              <p>
                Este sitio es un proyecto de demostración. Los formularios
                de Pedido y Contacto solicitan datos como nombre, correo
                electrónico, teléfono y dirección únicamente para fines
                ilustrativos del funcionamiento de la interfaz.
              </p>
            </section>

            <section>
              <h2>2. Cómo usamos la información</h2>
              <p>
                Como no existe un backend conectado, ningún dato ingresado
                en los formularios se almacena, se envía a un servidor ni se
                comparte con terceros. La información permanece únicamente
                en tu navegador mientras usas el sitio.
              </p>
            </section>

            <section>
              <h2>3. Cookies y almacenamiento local</h2>
              <p>
                Este sitio no utiliza cookies de seguimiento. El carrito de
                pedido se mantiene solo en la memoria de la página mientras
                la tienes abierta, y se reinicia al cerrar o recargar el
                sitio.
              </p>
            </section>

            <section>
              <h2>4. Servicios de terceros</h2>
              <p>
                La página de Contacto incluye un mapa embebido de Google
                Maps. Al cargarse, Google puede aplicar sus propias
                políticas de privacidad para ese contenido. Puedes
                consultarlas directamente en el sitio de Google.
              </p>
            </section>

            <section>
              <h2>5. Tus derechos</h2>
              <p>
                Dado que este sitio no almacena datos personales de forma
                persistente, no es necesario solicitar la eliminación de
                información: al no haber backend, no existe una base de
                datos donde se conserven tus datos.
              </p>
            </section>

            <section>
              <h2>6. Cambios a esta política</h2>
              <p>
                Esta política puede actualizarse en cualquier momento sin
                previo aviso. Te recomendamos revisarla periódicamente.
              </p>
            </section>

            <section>
              <h2>7. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta política, escríbenos a{' '}
                <a href="mailto:hola@nekocoffee.com">hola@nekocoffee.com</a>.
              </p>
            </section>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Privacidad
