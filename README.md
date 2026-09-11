# Nekko Coffee - Tienda en Línea
Sitio web para **Neko Coffee**, una cafetería ficticia de inspiración japonesa (kissaten / cat café). El proyecto **migró de HTML puro a una Single Page Application (SPA) construida con React, Vite y React Bootstrap**, con carrito de compras funcional y ruteo entre páginas. No cuenta con backend: el checkout y los formularios son una simulación con fines demostrativos.

## Estructura del proyecto
 
```
neko-coffee/
├── index.html                  → HTML base (meta tags, favicon, punto de montaje de React)
├── src/
│   ├── main.jsx                 → Punto de entrada: BrowserRouter + CartProvider
│   ├── App.jsx                  → Definición de rutas
│   ├── index.css                → Variables de diseño, reset y utilidades globales
│   ├── App.css                  → Estilos mínimos de layout
│   ├── context/
│   │   └── CartContext.jsx       → Estado global del carrito (agregar, quitar, actualizar cantidad)
│   ├── data/
│   │   └── products.js           → Catálogo de categorías y productos (fuente única de datos)
│   ├── components/
│   │   ├── Layout.jsx             → Estructura común: Navbar + contenido + Footer + BackToTop
│   │   ├── SiteNavbar.jsx         → Encabezado global, responsivo, con contador del carrito
│   │   ├── Footer.jsx             → Pie de página global (enlaces, contacto, redes, legal)
│   │   └── BackToTop.jsx          → Botón flotante para volver arriba
│   └── pages/
│       ├── Home.jsx               → Inicio: hero, carrusel de promos, productos destacados
│       ├── Menu.jsx               → Índice de categorías del menú
│       ├── Category.jsx           → Productos de una categoría (tabla + vista rápida en modal)
│       ├── ProductDetail.jsx      → Ficha técnica de un producto (specs, ingredientes, alérgenos)
│       ├── Nosotros.jsx           → Historia, misión, valores y gatos residentes
│       ├── Galeria.jsx            → Galería de fotos con lightbox en modal
│       ├── Checkout.jsx           → Carrito de pedido y formulario de compra
│       ├── Contacto.jsx           → Formulario de contacto, datos y mapa de Google Maps
│       ├── Faq.jsx                → Preguntas frecuentes
│       ├── Terminos.jsx           → Términos y condiciones
│       ├── Privacidad.jsx         → Política de privacidad
│       └── NotFound.jsx           → Página 404
└── public/
```

## Rutas y páginas
 
| Ruta | Página | Descripción |
|---|---|---|
| `/` | Inicio | Bienvenida, carrusel de promociones y cuadrícula de productos destacados. |
| `/menu` | Menú | Cuadrícula de categorías (Bebidas, Postres, Snacks). |
| `/menu/:categorySlug` | Categoría | Tabla de productos de esa categoría, con etiquetas y vista rápida en modal. |
| `/producto/:productId` | Ficha de producto | Detalle completo: precio, tamaños, ingredientes, alérgenos y productos relacionados. |
| `/nosotros` | Nosotros | Historia, misión, valores y los gatos residentes. |
| `/galeria` | Galería | Fotos de bebidas, postres, gatos y el espacio, con vista ampliada. |
| `/checkout` | Pedido | Carrito con los productos elegidos, datos del cliente, entrega y pago. |
| `/contacto` | Contacto | Formulario de contacto, datos de ubicación/horario y mapa embebido. |
| `/faq` | Preguntas frecuentes | Dudas comunes sobre pedidos, entregas y la cafetería. |
| `/terminos` | Términos y condiciones | Condiciones de uso del sitio. |
| `/privacidad` | Política de privacidad | Manejo de los datos ingresados en los formularios. |
| `*` | 404 | Página no encontrada. |
 
## Funcionalidades principales
 
- **Carrito de compras real**: los productos se agregan desde el botón "Comprar" (en el menú, la vista rápida o la ficha de producto) y aparecen dinámicamente en `/checkout`, con control de cantidad y opción de quitar cada ítem.
- **Confirmación de pedido**: al enviar el formulario de checkout se genera un número de pedido genérico (ej. `NEKO-123456`) a modo de demostración, ya que no hay backend ni procesamiento de pagos real.
- **Aviso visual (toast)** al agregar un producto al carrito.
- **Contador de productos** visible en el botón "Pedido" del encabezado.
- **Vistas de categoría y ficha técnica** con `Table`, `Badge`, `Accordion`, `ListGroup` y `Modal`.
- **Mapa real** de Google Maps embebido en Contacto.
- **Botón "Volver arriba"** flotante, con scroll automático al inicio en cada cambio de página.
- **Meta tags de SEO** (`title`, `description`, `keywords`) configurados en `index.html`.

## Notas técnicas
 
- **Sin backend**: el checkout y el formulario de contacto no procesan pagos ni envían datos a ningún servidor; todo el estado vive en memoria del navegador y se reinicia al recargar la página.
- **Imágenes**: actualmente se usan marcadores de posición de `placehold.co`. Están centralizadas en `src/data/products.js` y en los arreglos de `Home.jsx`.
- **Estilos**: no se usa CSS de terceros más allá de Bootstrap; cada página/componente tiene su propio archivo `.css` con la paleta de marca (dorado `#b5863f` / carbón `#201c18`).
## Cómo visualizar la página

1. Abrir el enlace desplegado en Netlify: `https://neko-coffee-v1.netlify.app/`.

## Autor

- **Estudiante:** Luis Enrique Valey Osorio (9490-21-16222)
- **Proyecto:** Tarea 1 - Tienda en Línea con HTML
