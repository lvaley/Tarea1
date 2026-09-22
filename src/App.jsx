import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Category from './pages/Category.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Galeria from './pages/Galeria.jsx'
import Checkout from './pages/Checkout.jsx'
import Contacto from './pages/Contacto.jsx'
import Faq from './pages/Faq.jsx'
import Terminos from './pages/Terminos.jsx'
import Privacidad from './pages/Privacidad.jsx'
import Login from './pages/Login.jsx'
import Perfil from './pages/Perfil.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:categorySlug" element={<Category />} />
        <Route path="producto/:productId" element={<ProductDetail />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="faq" element={<Faq />} />
        <Route path="terminos" element={<Terminos />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="login" element={<Login />} />
        <Route
          path="perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
