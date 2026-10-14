/** "Café Americano" -> "cafe-americano" (sin tildes, en minúsculas y con guiones). */
export default function slugify(text = '') {
  const slug = String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  // Si el nombre solo tenía símbolos, se genera un identificador de respaldo.
  return slug || `item-${Date.now().toString(36)}`
}
