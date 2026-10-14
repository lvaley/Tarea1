import Drinks from '../assets/Drinks.jpg'
import Dessert from '../assets/Dessert.jpg'
import Snacks from '../assets/Snacks.jpg'

/**
 * Las categorías del menú son fijas (coinciden con las que acepta la API: bebidas, postres y snacks).
 * Los productos ya no viven aquí: se cargan desde la API (ver context/CatalogContext.jsx).
 */
export const categories = [
  {
    slug: 'bebidas',
    name: 'Bebidas',
    tagline: 'Té y café preparados al estilo japonés.',
    image: Drinks,
  },
  {
    slug: 'postres',
    name: 'Postres',
    tagline: 'Dulces tradicionales, hechos en casa.',
    image: Dessert,
  },
  {
    slug: 'snacks',
    name: 'Snacks salados',
    tagline: 'Para acompañar tu bebida favorita.',
    image: Snacks,
  },
]

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug)
}
