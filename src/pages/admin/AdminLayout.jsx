import { NavLink, Outlet } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import './Admin.css'

/* Marco común del panel de administración: título y pestañas. */
function AdminLayout() {
  return (
    <Container className="section admin-section">
      <p className="eyebrow">Administración</p>
      <h1 className="admin-title">Panel de administración</h1>

      <Nav variant="pills" className="admin-tabs">
        <Nav.Link as={NavLink} to="/admin/productos">
          Productos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/pedidos">
          Pedidos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/banners">
          Banners del Home
        </Nav.Link>
      </Nav>

      <Outlet />
    </Container>
  )
}

export default AdminLayout
