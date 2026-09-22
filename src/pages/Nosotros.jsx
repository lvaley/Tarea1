import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import './Nosotros.css'

import AboutImage from '../assets/About.jpg'
import NekoMochi from '../assets/Nekko-Mochi.jpg'
import NekoSora from '../assets/Nekko-Sora.jpg'
import NekoKuro from '../assets/Nekko-Kuro.jpg'

const cats = [
  {
    name: 'Mochi',
    trait: 'El más dormilón',
    img: NekoMochi,
  },
  {
    name: 'Sora',
    trait: 'El más juguetón',
    img: NekoSora,
  },
  {
    name: 'Kuro',
    trait: 'El más curioso',
    img: NekoKuro,
  },
]

const values = [
  'Calidad artesanal en cada bebida y postre',
  'Respeto por la tradición japonesa del té y el café',
  'Bienestar animal y espacios amigables con los gatos',
  'Comunidad y tranquilidad por encima de la prisa',
]

function Nosotros() {
  return (
    <>
      <section className="nosotros-hero">
        <Container className="text-center">
          <p className="eyebrow">Nuestra historia</p>
          <h1>Sobre Neko Coffee</h1>
          <p className="nosotros-hero-text">
            Un viaje a Kioto, un kissaten escondido entre callejones y un
            gato dormido junto a la ventana: así nació la idea de traer esa
            misma calma a casa.
          </p>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Row className="align-items-center gy-4">
            <Col md={6}>
              <img
                src={AboutImage}
                alt="Interior de Neko Coffee"
                className="nosotros-img"
              />
            </Col>
            <Col md={6}>
              <h2 className="nosotros-heading">Nuestra historia</h2>
              <p className="nosotros-text">
                Neko Coffee abrió sus puertas en 2023 con la misión de traer
                la calma de los kissaten tradicionales de Japón a la ciudad:
                café y té preparados con dedicación, recetas japonesas
                cuidadas al detalle y la compañía de nuestros gatos
                residentes.
              </p>
              <h2 className="nosotros-heading mt-4">Nuestra misión</h2>
              <p className="nosotros-text">
                Ofrecer un espacio de pausa dentro de la rutina diaria,
                sirviendo bebidas y postres de calidad en un ambiente
                cálido, tranquilo y amigable con los animales.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section values-section">
        <Container>
          <Row className="gy-4 align-items-start">
            <Col md={5}>
              <p className="eyebrow">Lo que nos define</p>
              <h2 className="nosotros-heading">Nuestros valores</h2>
            </Col>
            <Col md={7}>
              <ListGroup variant="flush" className="values-list">
                {values.map((value) => (
                  <ListGroup.Item key={value}>{value}</ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="text-center mb-5">
            <p className="eyebrow">Los favoritos de la casa</p>
            <h2 className="nosotros-heading">Nuestros gatos residentes</h2>
          </div>
          <Row className="gy-4">
            {cats.map((cat) => (
              <Col key={cat.name} md={4}>
                <Card className="cat-card h-100">
                  <Card.Img variant="top" src={cat.img} alt={cat.name} />
                  <Card.Body className="text-center">
                    <Card.Title>{cat.name}</Card.Title>
                    <Badge bg="" className="tag-badge">
                      {cat.trait}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  )
}

export default Nosotros
