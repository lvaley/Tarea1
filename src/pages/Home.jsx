import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Carousel from 'react-bootstrap/Carousel'
import Card from 'react-bootstrap/Card'
import './Home.css'

import SakuraBanner from '../assets/Sakura-Banner.jpg'
import MochiBanner from '../assets/Mochi-Banner.jpg'
import RinconBanner from '../assets/Rincon-Banner.jpg'

import MatchaLatte from '../assets/Matcha-Latte.jpg'
import Dorayaki from '../assets/Dorayaki.jpg'
import HojichaLatte from '../assets/Hojicha-Latte.jpg'
import Mochi from '../assets/Mochi.jpg'
import SakuraLatte from '../assets/Sakura-Latte.jpg'
import Onigiri from '../assets/Onigiri.jpg'

const promos = [
  {
    img: SakuraBanner,
    title: 'Sakura Latte de temporada',
    text: 'Edición limitada con jarabe de flor de cerezo, disponible solo esta primavera.',
  },
  {
    img: MochiBanner,
    title: '2x1 en mochi los miércoles',
    text: 'Todos los miércoles, lleva dos mochis al precio de uno. Válido para llevar o en tienda.',
  },
  {
    img: RinconBanner,
    title: 'Nuevo rincón de lectura',
    text: 'Un espacio tranquilo con wifi, ideal para trabajar o leer acompañado de nuestros gatos.',
  },
]

const featured = [
  {
    img: MatchaLatte,
    name: 'Matcha Latte',
    desc: 'Té verde ceremonial con leche vaporizada.',
    price: 'Q28.00',
  },
  {
    img: Dorayaki,
    name: 'Dorayaki',
    desc: 'Panqueques rellenos de pasta de frijol dulce.',
    price: 'Q20.00',
  },
  {
    img: HojichaLatte,
    name: 'Hojicha Latte',
    desc: 'Té verde tostado, notas achocolatadas.',
    price: 'Q26.00',
  },
  {
    img: Mochi,
    name: 'Mochi (3 uds.)',
    desc: 'Relleno de helado, sabores de temporada.',
    price: 'Q24.00',
  },
  {
    img: SakuraLatte,
    name: 'Sakura Latte',
    desc: 'Edición de temporada con flor de cerezo.',
    price: 'Q30.00',
  },
  {
    img: Onigiri,
    name: 'Onigiri',
    desc: 'Bola de arroz envuelta en alga nori.',
    price: 'Q16.00',
  },
]

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

      <section className="section promo-section">
        <Container>
          <Carousel className="promo-carousel" fade>
            {promos.map((promo) => (
              <Carousel.Item key={promo.title}>
                <img src={promo.img} alt={promo.title} />
                <Carousel.Caption>
                  <h3>{promo.title}</h3>
                  <p>{promo.text}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      <section className="section featured-section">
        <Container>
          <div className="section-heading text-center">
            <p className="eyebrow">Nuestros favoritos</p>
            <h2>Lo más pedido en Neko Coffee</h2>
          </div>

          <Row className="gy-4 mt-4">
            {featured.map((item) => (
              <Col key={item.name} xs={6} md={4} lg={2}>
                <Card className="product-card h-100">
                  <Card.Img variant="top" src={item.img} alt={item.name} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.desc}</Card.Text>
                    <div className="product-price">{item.price}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

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
