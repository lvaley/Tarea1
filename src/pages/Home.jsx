import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Carousel from 'react-bootstrap/Carousel'
import Card from 'react-bootstrap/Card'
import { useBanners, useProducts } from '../context/CatalogContext.jsx'
import LoadingBlock from '../components/LoadingBlock.jsx'
import ErrorBlock from '../components/ErrorBlock.jsx'
import './Home.css'

const highlights = [
  {
    title: 'Ingredientes de Japón',
    text: 'Té matcha, hojicha y anko importados directamente para mantener el sabor tradicional.',
  },
  {
    title: 'Ambiente de cat café',
    text: 'Comparte tu visita con Mochi, Sora y Kuro, nuestros gatos residentes.',
  },
  {
    title: 'Pedidos para llevar',
    text: 'Ordena en línea y recoge en tienda o pide entrega a domicilio.',
  },
]

function Home() {
  const banners = useBanners()
  const products = useProducts()
  const featured = products.featured

  return (
    <>
      <section className="hero-section">
        <Container className="text-center">
          <p className="eyebrow">Kissaten &amp; Cat Café</p>
          <h1 className="hero-title">Neko Coffee</h1>
          <p className="hero-subtitle">
            Un rincón de calma inspirado en las cafeterías tradicionales de
            Japón. Café y té preparados con dedicación, postres artesanales
            y la compañía de nuestros gatos.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-neko">
              Ver el menú
            </Link>
            <Link to="/nosotros" className="btn-neko-outline">
              Conócenos
            </Link>
          </div>
        </Container>
      </section>

      {banners.visible.length > 0 || banners.status !== 'success' ? (
        <section className="section promo-section">
          <Container>
            {banners.status === 'error' && (
              <ErrorBlock message={banners.error} onRetry={banners.reload} />
            )}
            {(banners.status === 'idle' || banners.status === 'loading') && (
              <LoadingBlock label="Cargando promociones..." minHeight={320} />
            )}
            {banners.status === 'success' && (
              <Carousel className="promo-carousel" fade>
                {banners.visible.map((banner) => (
                  <Carousel.Item key={banner.id}>
                    <img src={banner.image} alt={banner.title} />
                    <Carousel.Caption>
                      <h3>{banner.title}</h3>
                      <p>{banner.text}</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </Container>
        </section>
      ) : null}

      <section className="section featured-section">
        <Container>
          <div className="section-heading text-center">
            <p className="eyebrow">Nuestros favoritos</p>
            <h2>Lo más pedido en Neko Coffee</h2>
          </div>

          {products.status === 'error' && (
            <div className="mt-4">
              <ErrorBlock message={products.error} onRetry={products.reload} />
            </div>
          )}
          {(products.status === 'idle' || products.status === 'loading') && (
            <LoadingBlock label="Cargando productos..." />
          )}
          {products.status === 'success' && (
            <Row className="gy-4 mt-4">
              {featured.map((item) => (
                <Col key={item.id} xs={6} md={4} lg={2}>
                  <Card className="product-card h-100">
                    <Card.Img variant="top" src={item.image} alt={item.name} />
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>{item.shortDesc}</Card.Text>
                      <div className="product-price">Q{item.price.toFixed(2)}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-5">
            <Link to="/menu" className="btn-neko-outline">
              Ver menú completo
            </Link>
          </div>
        </Container>
      </section>

      <section className="section highlights-section">
        <Container>
          <Row className="gy-4">
            {highlights.map((item) => (
              <Col key={item.title} md={4}>
                <div className="highlight-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="cta-section">
        <Container className="text-center">
          <h2>¿Listo para tu pedido?</h2>
          <p>Ordena en línea y recógelo en tienda o pide entrega a domicilio.</p>
          <Link to="/checkout" className="btn-neko cta-btn">
            Hacer un pedido
          </Link>
        </Container>
      </section>
    </>
  )
}

export default Home
