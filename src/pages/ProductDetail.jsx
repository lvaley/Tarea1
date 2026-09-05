import { useState } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Card from 'react-bootstrap/Card'
import {
  getCategory,
  getProduct,
  getProductsByCategory,
} from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import './ProductDetail.css'

function ProductDetail() {
  const { productId } = useParams()
  const product = getProduct(productId)
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [sizeIndex, setSizeIndex] = useState(0)

  if (!product) {
    return <Navigate to="/menu" replace />
  }

  const category = getCategory(product.category)
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  const selectedSize = product.sizes[sizeIndex]

  const handleBuy = () => {
    addItem(product, 1, selectedSize)
    navigate('/checkout')
  }

  return (
    <Container className="section">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/menu' }}>
          Menú
        </Breadcrumb.Item>
        <Breadcrumb.Item
          linkAs={Link}
          linkProps={{ to: `/menu/${category.slug}` }}
        >
          {category.name}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="gy-4 product-detail-row">
        <Col md={5}>
          <img src={product.image} alt={product.name} className="detail-img" />
        </Col>
        <Col md={7}>
          <div className="mb-2">
            {product.tags.map((tag) => (
              <Badge key={tag} bg="" className="tag-badge me-1">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-short">{product.shortDesc}</p>
          <div className="detail-price">
            Q{selectedSize.price.toFixed(2)}
          </div>

          {product.sizes.length > 1 && (
            <div className="size-picker">
              {product.sizes.map((size, index) => (
                <Form.Check
                  key={size.name}
                  type="radio"
                  id={`size-${size.name}`}
                  name="size"
                  label={`${size.name} — Q${size.price.toFixed(2)}`}
                  checked={sizeIndex === index}
                  onChange={() => setSizeIndex(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn-neko detail-buy-btn"
            onClick={handleBuy}
          >
            Comprar
          </button>

          <Accordion defaultActiveKey="0" className="detail-accordion">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Descripción</Accordion.Header>
              <Accordion.Body>{product.description}</Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Ingredientes</Accordion.Header>
              <Accordion.Body>
                <ul className="mb-0">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Alérgenos</Accordion.Header>
              <Accordion.Body>
                {product.allergens.length
                  ? product.allergens.join(', ')
                  : 'Este producto no contiene alérgenos comunes.'}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {related.length > 0 && (
        <div className="related-section">
          <h2 className="related-heading">También te puede interesar</h2>
          <Row className="gy-4">
            {related.map((item) => (
              <Col key={item.id} md={4}>
                <Link to={`/producto/${item.id}`} className="related-link">
                  <Card className="related-card h-100">
                    <Card.Img variant="top" src={item.image} alt={item.name} />
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <div className="product-price">
                        Q{item.price.toFixed(2)}
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  )
}

export default ProductDetail
