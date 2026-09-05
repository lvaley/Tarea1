import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { categories } from '../data/products.js'
import './Menu.css'

function Menu() {
  return (
    <Container className="section">
      <div className="text-center mb-5">
        <p className="eyebrow">Nuestro menú</p>
        <h1 className="menu-title">Elige una categoría</h1>
        <p className="menu-subtitle">
          Explora bebidas, postres y snacks inspirados en la tradición
          japonesa de los kissaten.
        </p>
      </div>

      <Row className="gy-4">
        {categories.map((cat) => (
          <Col key={cat.slug} md={4}>
            <Link to={`/menu/${cat.slug}`} className="category-card-link">
              <Card className="category-card h-100">
                <Card.Img variant="top" src={cat.image} alt={cat.name} />
                <Card.Body>
                  <Card.Title>{cat.name}</Card.Title>
                  <Card.Text>{cat.tagline}</Card.Text>
                  <span className="category-card-cta">Ver productos →</span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Menu
