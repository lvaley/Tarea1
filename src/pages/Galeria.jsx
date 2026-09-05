import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import './Galeria.css'

import MatchaLatte from '../assets/Matcha-Latte.jpg'
import Dorayaki from '../assets/Dorayaki.jpg'
import Mochi from '../assets/Mochi.jpg'
import NekoInterior from '../assets/Nekko-Coffe-Shop.jpg'
import NekoMochi from '../assets/Nekko-Mochi.jpg'
import NekoSora from '../assets/Nekko-Sora.jpg'
import NekoBar from '../assets/Nekko-bar.jpg'
import Taiyaki from '../assets/Taiyaki.jpg'
import RinconLectura from '../assets/Rincon.jpg'

const photos = [
  {
    src: MatchaLatte,
    alt: 'Matcha latte servido en taza de cerámica',
  },
  {
    src: Dorayaki,
    alt: 'Dorayaki relleno de anko',
  },
  {
    src: Mochi,
    alt: 'Mochi de helado',
  },
  {
    src: NekoInterior,
    alt: 'Interior de la cafetería',
  },
  {
    src: NekoMochi,
    alt: 'Mochi, gato residente, durmiendo en la ventana',
  },
  {
    src: NekoSora,
    alt: 'Sora, gato residente, jugando',
  },
  {
    src: NekoBar,
    alt: 'Barra de preparación de té y café',
  },
  {
    src: Taiyaki,
    alt: 'Taiyaki con forma de pez',
  },
  {
    src: RinconLectura,
    alt: 'Rincón de lectura con almohadones',
  },
]

function Galeria() {
  const [selected, setSelected] = useState(null)

  return (
    <Container className="section">
      <div className="text-center mb-5">
        <p className="eyebrow">Galería</p>
        <h1 className="galeria-title">Un vistazo a Neko Coffee</h1>
        <p className="galeria-subtitle">
          Bebidas, postres, gatos y el espacio que hacen de Neko Coffee un
          lugar especial.
        </p>
      </div>

      <Row className="g-3">
        {photos.map((photo) => (
          <Col key={photo.alt} xs={6} md={4}>
            <button
              type="button"
              className="galeria-thumb-btn"
              onClick={() => setSelected(photo)}
            >
              <img src={photo.src} alt={photo.alt} className="galeria-thumb" />
            </button>
          </Col>
        ))}
      </Row>

      <Modal
        show={selected !== null}
        onHide={() => setSelected(null)}
        centered
        size="lg"
      >
        {selected && (
          <>
            <Modal.Header closeButton />
            <Modal.Body className="p-0">
              <img
                src={selected.src}
                alt={selected.alt}
                className="galeria-modal-img"
              />
            </Modal.Body>
          </>
        )}
      </Modal>
    </Container>
  )
}

export default Galeria
