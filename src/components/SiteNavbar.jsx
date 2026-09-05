import { NavLink } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import { useCart } from '../context/CartContext.jsx'
import './SiteNavbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/menu', label: 'Menú' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/galeria', label: 'Galería' },
]

function SiteNavbar() {
  const { itemCount } = useCart()

  return (
    <Navbar expand="lg" fixed="top" className="site-navbar" collapseOnSelect>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="site-navbar-brand">
          NEKO COFFEE
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-lg-auto align-items-lg-center site-navbar-links">
            {links.map((link) => (
              <Nav.Link
                key={link.to}
                as={NavLink}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : undefined
                }
              >
                {link.label}
              </Nav.Link>
            ))}
            <Nav.Link as={NavLink} to="/checkout" className="site-navbar-cta">
              Pedido
              {itemCount > 0 && (
                <span className="cart-count-badge">{itemCount}</span>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default SiteNavbar
