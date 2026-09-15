import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './Footer.css'

/* Iconos minimalistas en línea (sin dependencias externas) */
const Icon = ({ children, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

const WhatsAppIcon = () => (
  <Icon>
    <path d="M20.5 11.9a8.4 8.4 0 1 1-3.7-6.9" />
    <path d="M20.5 11.9c0 4.6-3.8 8.4-8.4 8.4a8.4 8.4 0 0 1-4.3-1.2L3.5 20.5l1.5-4.1a8.3 8.3 0 0 1-1.3-4.5c0-4.6 3.8-8.4 8.4-8.4" />
    <path d="M9.2 9.3c.2-.6.6-.6.9-.6h.5c.2 0 .4 0 .6.5s.6 1.5.7 1.6c.1.1.1.3 0 .5-.1.2-.2.3-.4.5s-.3.3-.1.6c.2.4.9 1.4 1.9 1.9.3.2.5.1.7-.1.2-.2.6-.7.8-.9.2-.2.4-.2.6-.1s1.5.7 1.8.8c.2.1.4.2.4.3 0 .2 0 1-.4 1.4-.4.4-1.1.7-1.9.6-.8-.1-2.6-1-3.6-2.1-1-1.1-1.7-2.3-1.9-2.7-.2-.4-.6-1.2-.6-1.9s.4-1 .5-1.2Z" />
  </Icon>
)

const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
)

const InstagramIcon = () => (
  <Icon>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

const FacebookIcon = () => (
  <Icon>
    <path d="M14 21v-7h2.4l.4-3H14V9.2c0-.9.3-1.5 1.6-1.5H17V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8.4v3H10.8v7Z" />
  </Icon>
)

const TikTokIcon = () => (
  <Icon>
    <path d="M14 3.5c.4 2 1.8 3.4 4 3.6V9.6c-1.4 0-2.8-.4-4-1.2v6.4a5 5 0 1 1-4.2-4.9v2.5a2.5 2.5 0 1 0 1.8 2.4V3.5Z" />
  </Icon>
)

const XIcon = () => (
  <Icon>
    <path d="m4.5 4.5 15 15" />
    <path d="m19.5 4.5-15 15" />
  </Icon>
)

function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="footer-top gy-5">
          <Col xs={12} sm={6} md={3}>
            <h6 className="footer-heading">Acerca de Neko Coffee</h6>
            <ul className="footer-links">
              <li><Link to="/nosotros">Quiénes somos</Link></li>
              <li><Link to="/galeria">Nuestra Galería</Link></li>
            </ul>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <h6 className="footer-heading">Ayuda</h6>
            <ul className="footer-links">
              <li><Link to="/faq">Preguntas frecuentes</Link></li>
              <li><Link to="/privacidad">Política de privacidad</Link></li>
              <li><Link to="/terminos">Términos y condiciones</Link></li>
            </ul>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <h6 className="footer-heading">Contacto</h6>
            <ul className="footer-links footer-links-icon">
              <li><a href="#whatsapp"><WhatsAppIcon /><span>Escríbenos por WhatsApp</span></a></li>
              <li><a href="mailto:hola@nekocoffee.com"><MailIcon /><span>Envíanos un email</span></a></li>
            </ul>
            <Link to="/contacto" className="footer-contact-btn">
              Quiero contactarme
            </Link>
          </Col>

          <Col xs={12} sm={6} md={3} className="footer-brand-col">
            <div className="footer-brand">NEKO COFFEE</div>
            <p className="footer-tagline">Café e inspiración japonesa</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="TikTok"><TikTokIcon /></a>
              <a href="#" aria-label="X"><XIcon /></a>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <Row className="footer-bottom">
          <Col md={6} className="footer-legal">
            &copy; {new Date().getFullYear()} Neko Coffee. Todos los derechos reservados.
          </Col>
          <Col md={6} className="footer-credit">
            Desarrollado por <strong>Luis Enrique Valey Osorio</strong> &nbsp;·&nbsp; Carnet <strong>9490-21-16222</strong>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
