/**
 * Biblioteca de fotos del proyecto.
 *
 * La base de datos guarda texto, no archivos: cada producto o banner guarda la "clave" de una
 * foto (imageKey) y aquí se traduce a la imagen real. La clave es el nombre del archivo en
 * src/assets, en minúsculas y con guiones:  Matcha-Latte.jpg  ->  "matcha-latte".
 *
 * Para agregar una foto nueva basta con copiarla a src/assets (jpg, jpeg, png o webp):
 * aparece sola en la lista del panel de administración. No hay que registrarla en ningún lado.
 */
const files = import.meta.glob('../assets/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const toKey = (path) =>
  path
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const imageMap = Object.fromEntries(
  Object.entries(files).map(([path, src]) => [toKey(path), src])
)

const humanize = (key) => {
  const text = key.replace(/-/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Opciones para la lista desplegable del panel: [{ key, label, src }] */
export const imageOptions = Object.keys(imageMap)
  .sort()
  .map((key) => ({ key, label: humanize(key), src: imageMap[key] }))

const placeholderSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
  '<rect width="600" height="600" fill="#efe6d8"/>' +
  '<text x="300" y="310" font-family="sans-serif" font-size="30" fill="#8a6529" text-anchor="middle">Sin imagen</text>' +
  '</svg>'

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`

/** Orden de prioridad: URL externa, luego foto de la biblioteca, luego imagen de reserva. */
export function resolveImage({ imageUrl, imageKey } = {}) {
  return imageUrl || imageMap[imageKey] || PLACEHOLDER_IMAGE
}
