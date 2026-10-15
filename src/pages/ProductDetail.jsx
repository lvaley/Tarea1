import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Card from 'react-bootstrap/Card'
import { getCategory } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import { useProducts } from '../context/CatalogContext.jsx'
import LoadingBlock from '../components/LoadingBlock.jsx'
import ErrorBlock from '../components/ErrorBlock.jsx'
import './ProductDetail.css'

/* Vista del producto. Se separa en un componente con "key" para que, al pasar de un producto a
   otro (productos relacionados), el tamaño elegido se reinicie en vez de arrastrarse. */
function ProductView({ product, related }) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [sizeIndex, setSizeIndex] = useState(0)

  const category = getCategory(product.category)
  // Un producto puede no tener tamaños (los crea el administrador): entonces se usa su precio base.
  const selectedSize = product.sizes[sizeIndex] ?? null
  const price = selectedSize?.price ?? product.price

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
          linkProps={{ to: `/menu/${product.category}` }}
        >
          {category?.name ?? 'Menú'}
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
            Q{price.toFixed(2)}
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
                <Link to={`/producto/${item.slug}`} className="related-link">
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

function ProductDetail() {
  const { productId } = useParams()
  const { visible, status, error, reload, find } = useProducts()

  if (status === 'idle' || status === 'loading') {
    return (
      <Container className="section">
        <LoadingBlock label="Cargando producto..." />
      </Container>
    )
  }
  if (status === 'error') {
    return (
      <Container className="section">
        <ErrorBlock message={error} onRetry={reload} />
      </Container>
    )
  }

  const product = find(productId)
  if (!product) {
    return (
      <Container className="section text-center">
        <p className="eyebrow">Producto no encontrado</p>
        <h1>Este producto no está disponible</h1>
        <p className="detail-missing">Pudo haber sido retirado del menú.</p>
        <Link to="/menu" className="btn-neko">
          Volver al menú
        </Link>
      </Container>
    )
  }

  const related = visible
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  return <ProductView key={product.id} product={product} related={related} />
}

export default ProductDetail
