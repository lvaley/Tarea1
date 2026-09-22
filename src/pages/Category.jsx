import { useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Modal from 'react-bootstrap/Modal'
import ListGroup from 'react-bootstrap/ListGroup'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Toast from 'react-bootstrap/Toast'
import { getCategory, getProductsByCategory } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import './Category.css'

function Category() {
  const { categorySlug } = useParams()
  const category = getCategory(categorySlug)
  const items = useMemo(
    () => getProductsByCategory(categorySlug),
    [categorySlug]
  )
  const [selected, setSelected] = useState(null)
  const [addedName, setAddedName] = useState(null)
  const { addItem } = useCart()

  const handleBuy = (product) => {
    addItem(product, 1)
    setSelected(null)
    setAddedName(product.name)
  }

  if (!category) {
    return <Navigate to="/menu" replace />
  }

  return (
    <Container className="section">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/menu' }}>
          Menú
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{category.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-4">
        <p className="eyebrow">Categoría</p>
        <h1 className="category-title">{category.name}</h1>
        <p className="category-subtitle">{category.tagline}</p>
      </div>

      <Table responsive hover className="product-table align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th className="d-none d-md-table-cell">Descripción</th>
            <th className="d-none d-sm-table-cell">Etiquetas</th>
            <th>Precio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="product-table-name">
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td className="d-none d-md-table-cell product-table-desc">
                {item.shortDesc}
              </td>
              <td className="d-none d-sm-table-cell">
                {item.tags.map((tag) => (
                  <Badge key={tag} bg="" className="tag-badge me-1">
                    {tag}
                  </Badge>
                ))}
              </td>
              <td className="product-table-price">Q{item.price.toFixed(2)}</td>
              <td className="text-end">
                <button
                  type="button"
                  className="btn-neko-outline btn-sm-neko"
                  onClick={() => setSelected(item)}
                >
                  Vista rápida
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={selected !== null}
        onHide={() => setSelected(null)}
        centered
        size="lg"
      >
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selected.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="quickview-body">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="quickview-img"
                />
                <div>
                  <div className="mb-2">
                    {selected.tags.map((tag) => (
                      <Badge key={tag} bg="" className="tag-badge me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="quickview-desc">{selected.description}</p>
                  <ListGroup variant="flush" className="quickview-list">
                    <ListGroup.Item>
                      <strong>Ingredientes:</strong>{' '}
                      {selected.ingredients.join(', ')}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Alérgenos:</strong>{' '}
                      {selected.allergens.length
                        ? selected.allergens.join(', ')
                        : 'Ninguno'}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Link
                to={`/producto/${selected.id}`}
                className="btn-neko-outline"
                onClick={() => setSelected(null)}
              >
                Ver ficha completa
              </Link>
              <button
                type="button"
                className="btn-neko"
                onClick={() => handleBuy(selected)}
              >
                Comprar
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <ToastContainer position="bottom-end" className="p-3 cart-toast">
        <Toast
          show={addedName !== null}
          onClose={() => setAddedName(null)}
          delay={2200}
          autohide
          bg="dark"
        >
          <Toast.Body className="text-white">
            {addedName} se agregó a tu pedido. Ve a la página de Pedido para
            confirmarlo.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default Category
