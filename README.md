# Nekko Coffee - Tienda en Línea
Sitio web estático para **Neko Coffee**, una cafetería ficticia de inspiración japonesa (kissaten / cat café). El proyecto está construido **únicamente con HTML puro**, sin CSS ni JavaScript.

## Estructura del proyecto
 
```
neko-coffee
├── index.html       → Página de inicio
├── menu.html        → Menú de productos (con botón "Comprar")
├── nosotros.html     → Historia, misión y gatos residentes
├── galeria.html      → Galería de imágenes
├── checkout.html     → Formulario de pedido
└── contacto.html     → Formulario de contacto y ubicación
```

## Contenido de las páginas
 
| Página | Descripción |
|---|---|
| **Inicio** (`index.html`) | Presentación general de la cafetería y destacados. |
| **Menú** (`menu.html`) | Bebidas, postres y snacks organizados en tarjetas (`fieldset`), cada una con un botón "Comprar" que redirige al Pedido. |
| **Nosotros** (`nosotros.html`) | Historia de la cafetería, misión, valores y los gatos residentes. |
| **Galería** (`galeria.html`) | Fotos de bebidas, postres, gatos y el espacio. |
| **Pedido** (`checkout.html`) | Formulario de pedido: datos del cliente, selección de productos, tipo de entrega y método de pago. |
| **Contacto** (`contacto.html`) | Formulario de contacto, datos de ubicación y horario. |

## Notas técnicas
 
- **Sin CSS**: no hay hojas de estilo ni etiquetas `<style>`. La alineación izquierda/derecha del header y footer se logra con atributos HTML de tabla (`width`, `align="right"`), no con CSS.
- **Sin JavaScript**: no hay lógica de carrito de compras ni validaciones dinámicas.
- **Botón "Comprar"**: cada producto del menú está envuelto en un `<form action="checkout.html" method="get">`. Al enviarse, el navegador simplemente redirige a la página de Pedido.
- **Checkout no funcional**: el formulario de `checkout.html` no procesa pagos ni pedidos reales.
- **Imágenes**: se usan imágenes obtenidas de Pexels (contenido para uso publico).

## Cómo visualizar la página

1. Abrir el enlace desplegado en Netlify: `https://neko-coffee.netlify.app/`.

## Autor

- **Estudiante:** Luis Enrique Valey Osorio (9490-21-16222)
- **Proyecto:** Tarea 1 - Tienda en Línea con HTML
