import { NavLink, useNavigate } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './SiteNavbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/menu', label: 'Menú' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/galeria', label: 'Galería' },
]

/* Iniciales del usuario para el avatar circular (ej. "Luis Valey" -> "LV") */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function SiteNavbar() {
  const { itemCount } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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

            {/* Bloque que reacciona en tiempo real al estado de la sesión */}
            {isAuthenticated ? (
              <NavDropdown
                align="end"
                className="site-navbar-user"
                title={
                  <span className="site-navbar-user-title">
                    <span className="user-avatar">
                      {getInitials(user.name)}
                    </span>
                    <span className="user-name">{user.name}</span>
                  </span>
                }
                id="user-menu"
              >
                <NavDropdown.Item as={NavLink} to="/perfil">
                  Mi perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link
                as={NavLink}
                to="/login"
                className="site-navbar-login"
              >
                Iniciar sesión
              </Nav.Link>
            )}

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
