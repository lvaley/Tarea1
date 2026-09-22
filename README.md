# Nekko Coffee - Tienda en Línea
Sitio web para **Neko Coffee**, una cafetería ficticia de inspiración japonesa (kissaten / cat café). El proyecto **migró de HTML puro a una Single Page Application (SPA) construida con React, Vite y React Bootstrap**, con carrito de compras funcional y ruteo entre páginas. No cuenta con backend: el checkout y los formularios son una simulación con fines demostrativos.

## Estructura del proyecto
 
```
neko-coffee/
├── index.html                  → HTML base (meta tags, favicon, punto de montaje de React)
├── src/
│   ├── main.jsx                 → Punto de entrada: BrowserRouter + AuthProvider + CartProvider
│   ├── App.jsx                  → Definición de rutas (incluye la ruta protegida /perfil)
│   ├── index.css                → Variables de diseño, reset y utilidades globales
│   ├── App.css                  → Estilos mínimos de layout
│   ├── context/
│   │   ├── CartContext.jsx       → Estado global del carrito (agregar, quitar, actualizar cantidad)
│   │   └── AuthContext.jsx       → Estado global de sesión con useReducer (login, logout, usuario)
│   ├── data/
│   │   └── products.js           → Catálogo de categorías y productos (fuente única de datos)
│   ├── components/
│   │   ├── Layout.jsx             → Estructura común: Navbar + contenido + Footer + BackToTop
│   │   ├── SiteNavbar.jsx         → Encabezado global, reactivo al estado de sesión y al carrito
│   │   ├── Footer.jsx             → Pie de página global (enlaces, contacto, redes, legal)
│   │   ├── BackToTop.jsx          → Botón flotante para volver arriba
│   │   └── ProtectedRoute.jsx     → Guardián de rutas privadas (redirige a /login sin sesión)
│   └── pages/
│       ├── Home.jsx               → Inicio: hero, carrusel de promos, productos destacados
│       ├── Menu.jsx               → Índice de categorías del menú
│       ├── Category.jsx           → Productos de una categoría (tabla + vista rápida en modal)
│       ├── ProductDetail.jsx      → Ficha técnica de un producto (specs, ingredientes, alérgenos)
│       ├── Nosotros.jsx           → Historia, misión, valores y gatos residentes
│       ├── Galeria.jsx            → Galería de fotos con lightbox en modal
│       ├── Checkout.jsx           → Carrito de pedido y formulario de compra
│       ├── Contacto.jsx           → Formulario de contacto, datos y mapa de Google Maps
│       ├── Login.jsx              → Formulario de inicio de sesión con validación
│       ├── Perfil.jsx             → Dashboard del usuario autenticado (ruta protegida)
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
| `/login` | Iniciar sesión | Formulario de autenticación con validación de campos. |
| `/perfil` | Perfil | **Ruta protegida.** Datos de la sesión e historial de pedidos del usuario. |
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
- **Autenticación simulada** (Login / Logout / Perfil) con estado global, encabezado que se sincroniza en tiempo real y ruta protegida. Ver la sección *Autenticación y estado global*.
- **Campo de contraseña con botón para mostrar u ocultar** el texto ingresado.
- **Mapa real** de Google Maps embebido en Contacto.
- **Botón "Volver arriba"** flotante, con scroll automático al inicio en cada cambio de página.
- **Meta tags de SEO** (`title`, `description`, `keywords`) configurados en `index.html`.

## Autenticación y estado global

La gestión de sesión se implementó con **Context API + `useReducer`**, manteniendo el mismo patrón que ya usaba el carrito (`CartContext`) y sin agregar dependencias externas de manejo de estado.

### Arquitectura (`src/context/AuthContext.jsx`)

**Estado inicial:**

```js
{ isAuthenticated: false, user: null, status: 'idle', error: null }
```

Cuando hay sesión, `user` contiene `{ name, email, role, loginDate, orders }`.

**Acciones del reducer:**

| Acción | Efecto |
|---|---|
| `LOGIN_REQUEST` | Pone `status: 'loading'` mientras se validan las credenciales. |
| `LOGIN_SUCCESS` | Guarda los datos del usuario y pone `isAuthenticated: true`. |
| `LOGIN_FAILURE` | Registra el mensaje de error; la sesión no se abre. |
| `LOGOUT` | Limpia la sesión y restablece el estado inicial. |

El estado y las funciones se exponen mediante el hook personalizado **`useAuth()`**, que devuelve `{ user, isAuthenticated, status, error, login, logout }`.

### Sincronización en tiempo real

El `Navbar` consume `useAuth()`, por lo que reacciona automáticamente a cualquier cambio de sesión sin recargar la página:

- **Sin sesión:** se muestra el enlace "Iniciar sesión".
- **Con sesión:** ese enlace se oculta y aparece un menú con el avatar (iniciales), el nombre del usuario, acceso a "Mi perfil" y el botón "Cerrar sesión".

### Credenciales de prueba

El proyecto no tiene backend, por lo que el login valida contra un arreglo de usuarios simulados definido en `AuthContext.jsx`:

| Correo | Contraseña | Rol |
|---|---|---|
| `luis@nekocoffee.com` | `12345678` | Administrador |
| `cliente@nekocoffee.com` | `12345678` | Cliente frecuente |

Cada usuario tiene su propio historial de pedidos simulado, visible en `/perfil`.

> Las contraseñas están en texto plano únicamente porque se trata de una simulación académica sin servidor. En un proyecto real nunca deben almacenarse así.

## Notas técnicas
 
- **Sin backend**: el login, el checkout y el formulario de contacto no procesan datos reales ni los envían a ningún servidor; todo el estado vive en memoria del navegador y se reinicia al recargar la página (incluida la sesión activa).
- **Imágenes**: son archivos reales alojados en `src/assets/`, importados desde `src/data/products.js` y desde los arreglos de `Home.jsx`.
- **Estilos**: no se usa CSS de terceros más allá de Bootstrap; cada página/componente tiene su propio archivo `.css` con la paleta de marca (dorado `#b5863f` / carbón `#201c18`).
## Cómo visualizar la página

1. Abrir el enlace desplegado en Netlify: `https://neko-coffee-v1.netlify.app/`.

## Autor

- **Estudiante:** Luis Enrique Valey Osorio (9490-21-16222)
- **Proyecto:** Tienda en Línea con React, Bootstrap, React Router y estado global (Context API + useReducer)
