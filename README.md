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
│   │   ├── AuthContext.jsx       → Estado global de sesión con useReducer (login, registro, logout, sesión persistente)
│   │   └── CatalogContext.jsx    → Estado global del catálogo con useReducer: productos y banners desde la API (y su CRUD)
│   ├── hooks/
│   │   ├── useMyOrders.js        → Historial de pedidos del usuario: carga por páginas y cancelación
│   │   └── useAdminOrders.js     → Pedidos de todos los clientes (admin): filtros, búsqueda, páginas y cambio de estado
│   ├── services/
│   │   └── api.js                → Cliente HTTP de la API (URL base, token, errores, tiempo de espera)
│   ├── data/
│   │   ├── products.js           → Categorías del menú (fijas: bebidas, postres y snacks)
│   │   ├── orders.js             → Etiquetas de estados, entrega y pago; formato de fechas y dinero
│   │   └── images.js             → Biblioteca de fotos: traduce imageKey/imageUrl a la imagen real
│   ├── components/
│   │   ├── Layout.jsx             → Estructura común: Navbar + contenido + Footer + BackToTop
│   │   ├── SiteNavbar.jsx         → Encabezado global, reactivo al estado de sesión y al carrito
│   │   ├── Footer.jsx             → Pie de página global (enlaces, contacto, redes, legal)
│   │   ├── BackToTop.jsx          → Botón flotante para volver arriba
│   │   ├── ProtectedRoute.jsx     → Guardián de rutas privadas (redirige a /login sin sesión)
│   │   ├── SessionCheck.jsx       → Indicador mientras se verifica la sesión guardada
│   │   ├── SessionExpiryHandler.jsx → Toast + redirección a /login cuando caduca el token
│   │   ├── PasswordToggle.jsx     → Botón mostrar/ocultar contraseña (Login y Registro)
│   │   ├── ImagePicker.jsx        → Selector de imagen del panel (lista de fotos + URL opcional)
│   │   ├── ConfirmModal.jsx       → Confirmación antes de acciones irreversibles (eliminar, cancelar)
│   │   ├── OrderStatusBadge.jsx   → Etiqueta de color según el estado del pedido
│   │   ├── OrderDetailModal.jsx   → Detalle de un pedido (productos, entrega, pago, estado)
│   │   ├── LoadingBlock.jsx       → Estado de carga (con aviso si el servidor tarda)
│   │   └── ErrorBlock.jsx         → Error de carga con botón «Reintentar»
│   └── pages/
│       ├── Home.jsx               → Inicio: hero, carrusel de promos, productos destacados
│       ├── Menu.jsx               → Índice de categorías del menú
│       ├── Category.jsx           → Productos de una categoría (tabla + vista rápida en modal)
│       ├── ProductDetail.jsx      → Ficha técnica de un producto (specs, ingredientes, alérgenos)
│       ├── Nosotros.jsx           → Historia, misión, valores y gatos residentes
│       ├── Galeria.jsx            → Galería de fotos con lightbox en modal
│       ├── Checkout.jsx           → Carrito de pedido y formulario de compra
│       ├── Contacto.jsx           → Formulario de contacto, datos y mapa de Google Maps
│       ├── Login.jsx              → Formulario de inicio de sesión (API real)
│       ├── Register.jsx           → Registro de nuevos clientes (API real)
│       ├── admin/                 → Panel de administración (solo rol admin)
│       │   ├── AdminLayout.jsx    → Marco y pestañas del panel
│       │   ├── AdminProducts.jsx  → Tabla de productos: crear, editar, eliminar y activar/destacar
│       │   ├── ProductFormModal.jsx → Formulario de alta/edición de productos
│       │   ├── AdminOrders.jsx    → Pedidos de todos los clientes: buscar, filtrar y cambiar su estado
│       │   ├── AdminBanners.jsx   → Tabla de banners del carrusel del Home
│       │   └── BannerFormModal.jsx → Formulario de alta/edición de banners
│       ├── Perfil.jsx             → Dashboard del usuario autenticado (ruta protegida)
│       ├── Faq.jsx                → Preguntas frecuentes
│       ├── Terminos.jsx           → Términos y condiciones
│       ├── Privacidad.jsx         → Política de privacidad
│       └── NotFound.jsx           → Página 404
├── .env.example                → Variables del frontend (VITE_API_URL)
├── backend/                    → API Node.js + Express + MongoDB (ver sección Backend)
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
| `/checkout` | Pedido | Carrito con los productos elegidos; con sesión iniciada, datos de contacto, entrega y pago, y **crea el pedido en la API**. |
| `/contacto` | Contacto | Formulario de contacto, datos de ubicación/horario y mapa embebido. |
| `/login` | Iniciar sesión | Formulario de autenticación contra la API, con validación de campos. |
| `/register` | Crear cuenta | Registro de nuevos clientes en MongoDB; inicia sesión automáticamente. |
| `/perfil` | Perfil | **Ruta protegida.** Datos de la cuenta e **historial real de pedidos** (detalle, estados y cancelación). |
| `/admin/productos` | Admin · Productos | **Solo administradores.** Alta, edición, eliminación y visibilidad de productos. |
| `/admin/pedidos` | Admin · Pedidos | **Solo administradores.** Todos los pedidos: búsqueda, filtro por estado, detalle y cambio de estado. |
| `/admin/banners` | Admin · Banners | **Solo administradores.** Gestión de los banners del carrusel del Home. |
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
- **Autenticación real** (Registro / Login / Logout / Perfil) contra la API, con sesión que sobrevive a recargar la página, estado global, encabezado que se sincroniza en tiempo real y ruta protegida. Ver la sección *Autenticación y estado global*.
- **Catálogo desde la API**: menú, categorías, ficha de producto, banners y destacados del Home se cargan de MongoDB, con estados de carga y de error (con «Reintentar»).
- **Pedidos reales**: el Checkout crea el pedido en MongoDB (el servidor calcula precios y total) y el Perfil muestra el historial con estados, detalle y cancelación.
- **Panel de administración** (rol `admin`): crear, editar y eliminar productos y banners, y gestionar los pedidos de todos los clientes (buscar, filtrar y cambiar su estado) desde la interfaz; los cambios se reflejan al instante en el sitio público.
- **Campo de contraseña con botón para mostrar u ocultar** el texto ingresado.
- **Mapa real** de Google Maps embebido en Contacto.
- **Botón "Volver arriba"** flotante, con scroll automático al inicio en cada cambio de página.
- **Meta tags de SEO** (`title`, `description`, `keywords`) configurados en `index.html`.

## Autenticación y estado global

La sesión se gestiona con **Context API + `useReducer`** (mismo patrón que el carrito) y se valida contra la **API real** (`/api/auth/*`) del backend, que guarda los usuarios en MongoDB Atlas.

### Arquitectura

| Archivo | Responsabilidad |
|---|---|
| `src/services/api.js` | Cliente HTTP: URL base (`VITE_API_URL`), token en cada petición, errores normalizados (`ApiError`), tiempo de espera de 60 s y aviso global si el servidor rechaza el token (401). |
| `src/context/AuthContext.jsx` | Estado global de la sesión (`useReducer`) y las funciones `login`, `register`, `logout`. Expuesto con el hook `useAuth()`. |
| `src/components/ProtectedRoute.jsx` | Protege rutas privadas (`/perfil`). Espera a que se verifique la sesión guardada antes de decidir. |
| `src/pages/Login.jsx` / `Register.jsx` | Formularios con validación en el cliente y mensajes de error del servidor. |

**Estado:** `{ isAuthenticated, user, token, status, error, notice, isInitializing }`. El `user` (`id`, `name`, `email`, `role`, `membership`, `lastLogin`, `createdAt`) es el que devuelve el servidor.

**Acciones del reducer:**

| Acción | Efecto |
|---|---|
| `LOGIN_REQUEST` | `status: 'loading'` mientras el servidor valida. |
| `LOGIN_SUCCESS` | Guarda el usuario y el token; `isAuthenticated: true`. Se usa tanto al iniciar sesión como al registrarse. |
| `LOGIN_FAILURE` | Guarda el mensaje de error del servidor (ej. 401 «Correo o contraseña incorrectos.»). |
| `LOGOUT` | Limpia la sesión y borra el token guardado. Con `{ expired: true }` (caducidad del token) deja además el aviso y la señal `sessionExpired` para redirigir a `/login`. |
| `SESSION_RESTORED` | La sesión guardada en el navegador sigue siendo válida (verificada con `GET /api/auth/me`). |
| `SESSION_INVALID` | No se pudo verificar la sesión guardada porque el servidor no responde: se muestra un aviso. |
| `EXPIRY_HANDLED` | Baja la señal `sessionExpired` cuando el aviso (Toast) ya se cerró. |
| `CLEAR_ERROR` | Descarta el error al cambiar entre Login y Registro. |

### Sesión persistente

El token JWT se guarda en `localStorage` (`neko_token`). Al cargar la app, si existe, se valida con `GET /api/auth/me`; mientras tanto `isInitializing` es `true`, de modo que recargar `/perfil` no expulsa al usuario al login. Si el token ya venció se descarta sin consultar al servidor; si el servidor no responde, el token se conserva para reintentar. Cualquier respuesta 401 posterior cierra la sesión automáticamente (ver *Seguridad con JWT y expiración de sesión*).

### Sincronización en tiempo real

El `Navbar` consume `useAuth()` y reacciona sin recargar la página:

- **Sin sesión:** enlace «Iniciar sesión».
- **Con sesión:** avatar con iniciales, nombre, «Mi perfil» y «Cerrar sesión».
- **Mientras se verifica la sesión guardada:** no muestra ninguno de los dos, para evitar parpadeos.

### Cuentas de prueba

Se crean con `npm run seed` en el backend. También se puede crear una cuenta propia en `/register`; las cuentas registradas son siempre de tipo `cliente`.

## Pedidos (frontend)

**Checkout (`/checkout`).** Muestra los productos elegidos desde el menú, con control de cantidad. Para confirmar hace falta una cuenta (así el pedido queda ligado a un usuario): un visitante ve su carrito y un botón «Inicia sesión para confirmar» que, tras entrar, lo devuelve al Checkout con el carrito intacto. Con sesión iniciada, el formulario viene prellenado con su nombre y correo; pide teléfono, tipo de entrega (la dirección es obligatoria solo a domicilio), método de pago y notas opcionales.

- Solo se envía **qué producto, tamaño y cantidad**: nombres, precios y total los calcula el servidor con los datos de MongoDB, así que no se pueden alterar desde el navegador.
- Si algún producto ya no está disponible, se marca en su línea y se puede quitar para continuar con el resto.
- Si los precios cambiaron desde que se agregaron al carrito, la confirmación muestra el total vigente y lo avisa.
- Al confirmar se muestra el **número de pedido que genera el servidor** (`NEKO-123456`) y el carrito se vacía. El botón se bloquea mientras se envía para evitar pedidos duplicados.
- El pago no se procesa en línea: se hace al recibir el pedido o por transferencia.

**Perfil (`/perfil`).** Historial del usuario (más recientes primero, de 10 en 10 con «Cargar más») y su **total acumulado** (los cancelados no suman). Cada pedido tiene un estado con color: *Pendiente → En preparación → Listo → Entregado*, o *Cancelado*. Desde «Ver» se abre el detalle (productos, subtotales, entrega, pago y notas). Un pedido **pendiente** puede cancelarse con confirmación; si ya avanzó, el servidor lo rechaza y «Actualizar» refleja su estado actual.

> Los cambios de estado los hace un administrador desde la pestaña **Pedidos** del panel (ver *Catálogo y panel de administración*); el cliente los ve al abrir su Perfil o pulsar «Actualizar».

## Catálogo y panel de administración

### Estado global del catálogo (`CatalogContext`)

Productos y banners viven en un solo estado global (`useReducer`) que se alimenta de la API. Cuando el panel de administración crea, edita o elimina algo, **la respuesta del servidor entra al estado** y el Menú, la ficha del producto y el Home se actualizan al instante, sin volver a pedir datos.

| Acción | Efecto |
|---|---|
| `REQUEST` / `SUCCESS` / `FAILURE` | Ciclo de carga: `loading` → `success` o `error` (con «Reintentar»). |
| `UPSERT` | Un elemento creado o actualizado entra al estado, en su posición. |
| `REMOVE` | Un elemento eliminado sale del estado. |
| `RESET` | Se vacía al cambiar de usuario (login/logout), para no dejar a la vista datos de otra sesión. |

Los hooks `useProducts()` y `useBanners()` exponen los datos, sus estados y las operaciones (`create`, `replace`, `patch`, `remove`). Un administrador recibe también los elementos ocultos; las páginas públicas filtran por `isAvailable` / `isActive`.

### Panel de administración

Disponible en `/admin/productos`, `/admin/pedidos` y `/admin/banners`, solo para el rol `admin` (el enlace «Administrar» aparece en el menú del usuario). Quien no sea admin ve un aviso de acceso restringido, y la API lo rechaza igualmente (403).

- **Productos:** tabla con búsqueda y filtro por categoría; interruptores para *Disponible* (oculta o muestra en el menú) y *Destacado* (aparece en el Home); alta y edición en un formulario con tamaños, etiquetas, ingredientes, alérgenos e imagen; eliminación con confirmación.
- **Pedidos:** todos los pedidos de todos los clientes (más recientes primero, de 10 en 10), con búsqueda por número, nombre o correo y filtro por estado. En cada fila un selector ofrece **solo los pasos válidos** del pedido (*Pendiente → En preparación → Listo → Entregado*; se puede cancelar mientras no esté entregado) y «Ver» abre el detalle, incluida la cuenta que hizo el pedido. Cancelar pide confirmación. Si otro cambio llegó primero (por ejemplo, el cliente canceló), se muestra el motivo y la lista se actualiza con el estado real. «Actualizar» trae los pedidos nuevos.
- **Banners:** posición en el carrusel, activo/inactivo, imagen, edición y eliminación.
- **Validación doble:** el formulario avisa antes de enviar y, si el servidor rechaza algo (por ejemplo un nombre repetido), el error aparece junto al campo correspondiente.

### Imágenes

Cada producto y banner guarda en la base de datos el **nombre de una foto del proyecto** (`imageKey`) y/o una **URL externa** (`imageUrl`); se muestra primero la URL, luego la foto y, si no hay ninguna, una imagen de reserva.

**Para agregar una foto nueva:** copia el archivo (`jpg`, `jpeg`, `png` o `webp`) a `src/assets`. La clave es su nombre en minúsculas y con guiones (`Matcha-Latte.jpg` → `matcha-latte`) y aparece sola en la lista del panel, sin registrarla en ningún archivo. Como las fotos viajan con el sitio, hay que volver a desplegar el frontend para que estén disponibles en producción.

### Endpoints

Las rutas protegidas esperan `Authorization: Bearer <token>`. Todas las respuestas siguen el formato `{ "ok": true, "data": ... }` o `{ "ok": false, "message": "...", "errors": [...] }`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servidor y de la base de datos. |
| POST | `/api/auth/register` | Público | Registra un cliente. Devuelve el usuario y un token. |
| POST | `/api/auth/login` | Público | Valida credenciales contra MongoDB. Devuelve el usuario y un token. |
| GET | `/api/auth/me` | Token | Devuelve el usuario autenticado, leído de la base de datos. |
| GET | `/api/recursos` | Público | Lista de productos con filtros, orden y paginación. |
| GET | `/api/recursos/:id` | Público | Detalle de un producto (`:id` = id de MongoDB o slug, ej. `matcha-latte`). |
| POST | `/api/recursos` | Admin | Crea un producto. |
| PUT | `/api/recursos/:id` | Admin | Reemplaza el producto (exige `name`, `category` y precio). |
| PATCH | `/api/recursos/:id` | Admin | Actualiza solo los campos enviados. |
| DELETE | `/api/recursos/:id` | Admin | Elimina el producto. |
| GET | `/api/banners` | Público | Banners activos del carrusel del Home, en orden. |
| GET/POST/PUT/PATCH/DELETE | `/api/banners[/:id]` | GET público, resto Admin | CRUD de banners. |
| POST | `/api/orders` | Token | Crea un pedido. El servidor calcula nombres, precios y total. |
| GET | `/api/orders/me` | Token | Mis pedidos (más recientes primero) con `meta.totalSpent`. |
| GET | `/api/orders/:id` | Token | Detalle de un pedido por id o por número (`NEKO-123456`). Solo el dueño o un admin. |
| PATCH | `/api/orders/:id/cancel` | Token | El dueño cancela su pedido mientras esté `pendiente`. |
| GET | `/api/orders` | Admin | Todos los pedidos, con filtros `status` y `search`. |
| PATCH | `/api/orders/:id/status` | Admin | Cambia el estado del pedido. |

**Filtros de `GET /api/recursos`:** `category` (`bebidas`, `postres`, `snacks`), `search` (nombre, descripción o etiquetas), `tag`, `minPrice`, `maxPrice`, `featured=true` (destacados del Home), `sort` (`name`, `price`, `createdAt`; con `-` para descendente), `page` y `limit` (máx. 100). Ejemplo: `/api/recursos?category=bebidas&search=latte&minPrice=20&sort=price`.

**Visibilidad:** los visitantes solo ven productos con `isAvailable: true` y banners con `isActive: true`. Un administrador con token ve también los ocultos (`?available=false` / `?active=false` para filtrarlos).

### Pedidos

**Qué envía el cliente** (`POST /api/orders`):

```json
{
  "items": [
    { "productId": "matcha-latte", "size": "Grande", "qty": 2 },
    { "productId": "dorayaki", "qty": 1 }
  ],
  "customer": { "name": "Sora Kimura", "phone": "5555-1234", "email": "cliente@nekocoffee.com", "address": "Zona 10, Ciudad de Guatemala" },
  "delivery": "domicilio",
  "payment": "efectivo",
  "notes": "Sin azúcar"
}
```

- `productId` acepta el id de MongoDB o el slug. `delivery`: `recoger` o `domicilio`. `payment`: `efectivo`, `tarjeta` o `transferencia`.
- **Nombre, precio y total los calcula el servidor** con los datos de MongoDB: cualquier precio enviado por el cliente se ignora.
- `size` es obligatorio solo si el producto tiene varios tamaños; si tiene uno solo, se asigna automáticamente.
- La dirección solo es obligatoria para entrega a domicilio. Cantidad: entero de 1 a 20 por producto; hasta 30 líneas por pedido.
- Solo se pueden pedir productos disponibles. Si se repite el mismo producto y tamaño, las cantidades se suman.
- Cada línea guarda el nombre y el precio del momento: editar o eliminar un producto después **no altera el historial**.
- El número de pedido (`NEKO-` + 6 dígitos) lo genera el servidor.

**Estados:** `pendiente` → `preparando` → `listo` → `entregado`; desde cualquiera de los tres primeros se puede pasar a `cancelado`. `entregado` y `cancelado` son finales. El cliente solo puede cancelar mientras el pedido siga `pendiente`.

**Privacidad:** un cliente solo ve sus propios pedidos (los ajenos responden 404); el admin ve todos. Los pedidos no se eliminan: se cancelan. Se permiten hasta 30 pedidos creados por IP cada 15 minutos.

### Imágenes de productos y banners

La base de datos guarda texto, no archivos. Cada producto y cada banner tiene dos campos de imagen:

- `imageKey`: nombre de una foto del proyecto (biblioteca en `src/assets`). El frontend lo traduce a la imagen real (ver *Catálogo y panel de administración*).
- `imageUrl`: dirección `http(s)://` de una imagen externa (opcional).

El frontend usa primero `imageUrl`, luego `imageKey` y, si no hay ninguna, un placeholder. Claves actuales: `matcha-latte`, `hojicha-latte`, `americano`, `yuzu-tea`, `sakura-latte`, `dorayaki`, `mochi`, `taiyaki`, `castella`, `onigiri`, `sando-tamago` (productos) y `sakura-banner`, `mochi-banner`, `rincon-banner` (banners).

### Reglas del producto

- El **nombre es único** (sin distinguir mayúsculas, tildes ni espacios repetidos).
- El **slug** se genera una vez a partir del nombre y no cambia al renombrar, para mantener las URLs estables.
- Si el producto tiene **tamaños** (`sizes`), el precio base se calcula automáticamente como el más barato.

### Usuarios iniciales

| Correo | Contraseña | Rol |
|---|---|---|
| `luis@nekocoffee.com` | `12345678` | admin |
| `cliente@nekocoffee.com` | `12345678` | cliente |

En la base de datos las contraseñas se guardan encriptadas (bcrypt); estas son solo las credenciales de prueba.

### Seguridad aplicada

- Contraseñas con hash (bcrypt) y nunca devueltas por la API.
- El registro siempre crea usuarios con rol `cliente`; los administradores salen del seed.
- Escritura de productos y banners restringida al rol `admin`; el body solo acepta campos permitidos (no se pueden fijar `slug`, `_id` ni fechas).
- Límite de intentos en login, registro y creación de pedidos, y validación de tipos contra inyección NoSQL (en body y en la URL).
- Las búsquedas se escapan: el texto del usuario nunca se interpreta como expresión regular.
- URLs de imagen limitadas a `http(s)://` (se rechaza `javascript:`).
- Mensaje idéntico para correo inexistente y contraseña incorrecta.
- CORS restringido a los orígenes de `CLIENT_URL` y cabeceras de seguridad con `helmet`.

## Seguridad con JWT y expiración de sesión (Tarea 5)

La API es **stateless**: no guarda sesiones en el servidor. Cada petición protegida lleva un JSON Web Token firmado y el servidor solo necesita su clave secreta para validarlo.

### Backend: cómo se configuró la expiración

| Pieza | Archivo | Qué hace |
|---|---|---|
| Variables de entorno | `backend/.env` | `JWT_SECRET` (clave de firma) y `JWT_EXPIRES_IN=5m` (vigencia). Si no se define, el valor por defecto en `config/env.js` también es `5m`. |
| Generación | `src/utils/generateToken.js` | `jwt.sign({ sub, email, role }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '5m' })`. El claim `exp` queda a exactamente 300 s del `iat`. |
| Login | `POST /api/auth/login` | Valida credenciales y devuelve `{ user, token }`. |
| Middleware | `src/middlewares/auth.js` | `protect` extrae el token de `Authorization: Bearer <token>`, verifica firma y vigencia con la clave del servidor, y carga al usuario desde MongoDB. |

Respuestas de `protect` (y de `optionalAuth` cuando llega un token):

| Situación | Código | Cuerpo |
|---|---|---|
| Sin cabecera o sin token | 401 | `{ "ok": false, "error": "token_missing", "message": "Debes iniciar sesión..." }` |
| Token vencido (`TokenExpiredError`) | 401 | `{ "ok": false, "error": "token_expired", "message": "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente." }` |
| Firma inválida o token manipulado | 401 | `{ "ok": false, "error": "token_invalid", "message": "..." }` |

**Rutas protegidas:** `POST`, `PUT`, `PATCH` y `DELETE` de productos y banners (solo `admin`), todo `/api/orders` (sesión; admin para listar y cambiar estados) y `GET /api/auth/me`. Las lecturas públicas (`GET /api/recursos`, `GET /api/banners`) usan `optionalAuth`: sin token funcionan como visitante, con token válido el administrador ve además lo oculto, y con un token **vencido o inválido responden 401** para que el cliente se entere de que su sesión caducó aunque esté en una página pública.

> El rol que viaja en el token es informativo: antes de autorizar, el servidor vuelve a leer al usuario en MongoDB, así que quitarle el rol a alguien surte efecto de inmediato.

### Frontend: cómo se intercepta la caducidad

1. **Persistencia y estado:** al iniciar sesión el JWT se guarda en `localStorage` (`neko_token`) y en el estado global (`AuthContext`, Context API + `useReducer`), que mantiene `isAuthenticated` sincronizado.
2. **Inyección:** `src/services/api.js` es el cliente HTTP centralizado: adjunta `Authorization: Bearer <token>` en todas las peticiones a la API.
3. **Interceptor de respuestas:** en `api.js`, toda respuesta `401` (salvo login y registro, donde significa «credenciales incorrectas») llama al manejador global registrado por el `AuthContext`.
4. **Temporizador:** además del interceptor, el `AuthContext` lee el `exp` del JWT (`src/utils/jwt.js`) y programa un `setTimeout` que cierra la sesión **justo cuando el token vence**, aunque el usuario no haga ninguna petición. También se revisa al volver a la pestaña (los navegadores retrasan los temporizadores en segundo plano) y al abrir la app con un token ya vencido.
5. **Cierre de sesión:** el manejador borra el token y el usuario (memoria y `localStorage`) y dispara `LOGOUT` con `{ expired: true }`.
6. **Aviso y redirección:** `SessionExpiryHandler` (montado una sola vez en `App.jsx`) muestra un **Toast** de React-Bootstrap con «Su sesión ya no es válida o ha caducado» y redirige a `/login` con `useNavigate`, desde cualquier página. La pantalla de login conserva un `Alert` con el mismo mensaje y, al volver a entrar, el usuario regresa a la página donde estaba.

La verificación de la firma solo ocurre en el servidor; el navegador únicamente lee el `exp` para saber cuándo avisar. Si el reloj del equipo estuviera desfasado, el interceptor 401 sigue siendo la red de seguridad.

### Probar la expiración con Postman

Importar `Neko-Coffee-Tarea5.postman_collection.json` y cambiar la variable `baseUrl`. Orden: **1** Login (guarda el token) → **2** peticiones protegidas con éxito → **3** sin token (401) → **4** esperar 5 minutos y ejecutar «Token vencido» (401 `token_expired`).

## Notas técnicas
 
- **Conexión con la API**: están conectados el registro, el login y la sesión, el catálogo (menú, fichas, banners y destacados), el panel de administración, el checkout y el historial de pedidos. Lo único que no usa el servidor es el formulario de contacto, que no envía datos a ningún sitio.
- **Imágenes**: son archivos reales alojados en `src/assets/`, importados desde `src/data/products.js` y desde los arreglos de `Home.jsx`.
- **Estilos**: no se usa CSS de terceros más allá de Bootstrap; cada página/componente tiene su propio archivo `.css` con la paleta de marca (dorado `#b5863f` / carbón `#201c18`).
## Cómo visualizar la página

1. Abrir el enlace desplegado en Netlify: `https://neko-coffee-v3.netlify.app/`.
2. Abrir el enlace desplegado en Render: `https://tarea1-v02y.onrender.com`.

## Autor

- **Estudiante:** Luis Enrique Valey Osorio (9490-21-16222)
- **Proyecto:** Tienda en Línea con React, Bootstrap, React Router y estado global (Context API + useReducer)
