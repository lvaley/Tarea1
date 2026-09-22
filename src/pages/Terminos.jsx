import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './Legal.css'

function Terminos() {
  return (
    <Container className="section">
      <div className="mb-5">
        <p className="eyebrow">Legal</p>
        <h1 className="legal-title">Términos y condiciones</h1>
        <p className="legal-updated">Última actualización: septiembre 2026</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={9}>
          <div className="legal-content">
            <section>
              <h2>1. Aceptación de los términos</h2>
              <p>
                Al navegar y utilizar el sitio web de Neko Coffee, aceptas
                los presentes Términos y condiciones. Este sitio es un
                proyecto de demostración con fines educativos y no procesa
                pagos ni pedidos reales.
              </p>
            </section>

            <section>
              <h2>2. Uso del sitio</h2>
              <p>
                Te comprometes a utilizar este sitio únicamente con fines
                lícitos y de forma que no infrinja los derechos de terceros
                ni restrinja el uso del sitio por parte de otras personas.
              </p>
            </section>

            <section>
              <h2>3. Pedidos y checkout</h2>
              <p>
                La sección de Pedido de este sitio es una simulación. Los
                números de pedido generados son de carácter genérico y no
                están conectados a un sistema de procesamiento de pagos ni
                de gestión de entregas reales. Ningún cargo se realiza a
                través de este sitio.
              </p>
            </section>

            <section>
              <h2>4. Precios y disponibilidad</h2>
              <p>
                Los precios, productos, promociones e imágenes mostrados son
                de carácter ilustrativo y pueden no reflejar el menú real de
                un establecimiento.
              </p>
            </section>

            <section>
              <h2>5. Propiedad intelectual</h2>
              <p>
                El nombre "Neko Coffee", los textos, el diseño y los
                elementos gráficos de este sitio se presentan con fines
                demostrativos. Las imágenes utilizadas son marcadores de
                posición.
              </p>
            </section>

            <section>
              <h2>6. Limitación de responsabilidad</h2>
              <p>
                Neko Coffee no se hace responsable por daños derivados del
                uso de este sitio, dado su carácter demostrativo y no
                transaccional.
              </p>
            </section>

            <section>
              <h2>7. Cambios a estos términos</h2>
              <p>
                Estos términos pueden actualizarse en cualquier momento sin
                previo aviso. Te recomendamos revisarlos periódicamente.
              </p>
            </section>

            <section>
              <h2>8. Contacto</h2>
              <p>
                Si tienes preguntas sobre estos términos, escríbenos a{' '}
                <a href="mailto:hola@nekocoffee.com">hola@nekocoffee.com</a>.
              </p>
            </section>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Terminos
