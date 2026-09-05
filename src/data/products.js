import Drinks from '../assets/Drinks.jpg'
import Dessert from '../assets/Dessert.jpg'
import Snacks from '../assets/Snacks.jpg'

import MatchaLatte from '../assets/Matcha-Latte.jpg'
import HojichaLatte from '../assets/Hojicha-Latte.jpg'
import Americano from '../assets/Americano.jpg'
import YuzuTea from '../assets/Yuzu-tea.jpg'
import SakuraLatte from '../assets/Sakura-Latte.jpg'

import Dorayaki from '../assets/Dorayaki.jpg'
import Mochi from '../assets/Mochi.jpg'
import Taiyaki from '../assets/Taiyaki.jpg'
import Castella from '../assets/Castella.jpg'

import Onigiri from '../assets/Onigiri.jpg'
import SandoTamago from '../assets/Sando-tamago.jpg'

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

export const products = [
  {
    id: 'matcha-latte',
    category: 'bebidas',
    name: 'Matcha Latte',
    price: 28,
    image: MatchaLatte,
    shortDesc: 'Té verde ceremonial con leche vaporizada.',
    description:
      'Preparado con matcha ceremonial batido a mano al estilo tradicional (usucha) y combinado con leche vaporizada. Suave, cremoso y con notas vegetales características del té verde japonés.',
    tags: ['Popular', 'Vegetariano'],
    ingredients: ['Matcha ceremonial', 'Leche entera', 'Jarabe de agave'],
    allergens: ['Lácteos'],
    sizes: [
      { name: 'Mediano', price: 28 },
      { name: 'Grande', price: 32 },
    ],
  },
  {
    id: 'hojicha-latte',
    category: 'bebidas',
    name: 'Hojicha Latte',
    price: 26,
    image: HojichaLatte,
    shortDesc: 'Té verde tostado, notas achocolatadas.',
    description:
      'El hojicha es un té verde tostado a fuego que reduce su amargor y resalta notas tostadas y achocolatadas. Ideal para quienes buscan una alternativa suave a la cafeína.',
    tags: ['Bajo en cafeína', 'Vegetariano'],
    ingredients: ['Hojicha tostado', 'Leche entera', 'Jarabe de agave'],
    allergens: ['Lácteos'],
    sizes: [
      { name: 'Mediano', price: 26 },
      { name: 'Grande', price: 30 },
    ],
  },
  {
    id: 'cafe-americano',
    category: 'bebidas',
    name: 'Café Americano',
    price: 18,
    image: Americano,
    shortDesc: 'Café de filtro estilo japonés, tueste medio.',
    description:
      'Café de filtro preparado con el método pour-over japonés, que resalta claridad y notas suaves gracias a un tueste medio cuidadosamente seleccionado.',
    tags: ['Vegano'],
    ingredients: ['Café de tueste medio', 'Agua filtrada'],
    allergens: [],
    sizes: [
      { name: 'Mediano', price: 18 },
      { name: 'Grande', price: 21 },
    ],
  },
  {
    id: 'yuzu-tea',
    category: 'bebidas',
    name: 'Yuzu Tea',
    price: 22,
    image: YuzuTea,
    shortDesc: 'Té frío cítrico con yuzu.',
    description:
      'Té negro frío infusionado con mermelada de yuzu, un cítrico japonés aromático. Refrescante y ligeramente dulce, perfecto para los días calurosos.',
    tags: ['Vegano', 'Sin lácteos'],
    ingredients: ['Té negro', 'Mermelada de yuzu', 'Hielo'],
    allergens: [],
    sizes: [{ name: 'Único', price: 22 }],
  },
  {
    id: 'sakura-latte',
    category: 'bebidas',
    name: 'Sakura Latte',
    price: 30,
    image: SakuraLatte,
    shortDesc: 'Edición de temporada con flor de cerezo.',
    description:
      'Bebida de temporada con jarabe de flor de cerezo (sakura) y leche vaporizada, decorada con un toque floral. Disponible solo durante la temporada de primavera.',
    tags: ['Nuevo', 'Edición limitada', 'Vegetariano'],
    ingredients: ['Jarabe de sakura', 'Leche entera'],
    allergens: ['Lácteos'],
    sizes: [{ name: 'Único', price: 30 }],
  },
  {
    id: 'dorayaki',
    category: 'postres',
    name: 'Dorayaki',
    price: 20,
    image: Dorayaki,
    shortDesc: 'Panqueques rellenos de pasta de frijol dulce.',
    description:
      'Dos panqueques esponjosos rellenos de anko, pasta de frijol azuki dulce. Un clásico de la repostería japonesa, suave y ligeramente dulce.',
    tags: ['Vegetariano', 'Popular'],
    ingredients: ['Harina de trigo', 'Huevo', 'Pasta de frijol azuki (anko)'],
    allergens: ['Gluten', 'Huevo'],
    sizes: [{ name: 'Unidad', price: 20 }],
  },
  {
    id: 'mochi',
    category: 'postres',
    name: 'Mochi (3 unidades)',
    price: 24,
    image: Mochi,
    shortDesc: 'Relleno de helado, sabores de temporada.',
    description:
      'Mochi de arroz glutinoso relleno de helado, disponible en sabores de temporada como matcha, mango y fresa. Se sirve en set de 3 unidades.',
    tags: ['Sin gluten', 'Vegetariano'],
    ingredients: ['Harina de arroz glutinoso', 'Helado', 'Azúcar'],
    allergens: ['Lácteos'],
    sizes: [{ name: 'Set de 3', price: 24 }],
  },
  {
    id: 'taiyaki',
    category: 'postres',
    name: 'Taiyaki',
    price: 22,
    image: Taiyaki,
    shortDesc: 'Waffle con forma de pez, relleno de crema o anko.',
    description:
      'Waffle en forma de pez (símbolo de buena fortuna en Japón), horneado al momento y relleno a elección de crema pastelera o pasta de anko.',
    tags: ['Vegetariano'],
    ingredients: ['Harina de trigo', 'Huevo', 'Crema pastelera o anko'],
    allergens: ['Gluten', 'Huevo', 'Lácteos'],
    sizes: [{ name: 'Unidad', price: 22 }],
  },
  {
    id: 'castella',
    category: 'postres',
    name: 'Castella',
    price: 18,
    image: Castella,
    shortDesc: 'Bizcocho japonés esponjoso.',
    description:
      'Bizcocho japonés de origen portugués, horneado lentamente hasta lograr una textura húmeda y esponjosa. Se sirve en rebanadas.',
    tags: ['Vegetariano'],
    ingredients: ['Harina de trigo', 'Huevo', 'Miel'],
    allergens: ['Gluten', 'Huevo'],
    sizes: [{ name: 'Rebanada', price: 18 }],
  },
  {
    id: 'onigiri',
    category: 'snacks',
    name: 'Onigiri',
    price: 16,
    image: Onigiri,
    shortDesc: 'Bola de arroz envuelta en alga nori.',
    description:
      'Bola de arroz japonés rellena a elección (salmón, atún o ciruela encurtida) y envuelta en alga nori crujiente.',
    tags: ['Sin gluten'],
    ingredients: ['Arroz japonés', 'Alga nori', 'Relleno a elección'],
    allergens: ['Pescado (según relleno)'],
    sizes: [{ name: 'Unidad', price: 16 }],
  },
  {
    id: 'sando-tamago',
    category: 'snacks',
    name: 'Sando de Tamago',
    price: 20,
    image: SandoTamago,
    shortDesc: 'Sándwich japonés de huevo.',
    description:
      'Pan de molde suave relleno de una cremosa mezcla de huevo, al estilo de los sandos de las tiendas de conveniencia japonesas (konbini).',
    tags: ['Vegetariano', 'Popular'],
    ingredients: ['Pan de molde', 'Huevo', 'Mayonesa'],
    allergens: ['Gluten', 'Huevo'],
    sizes: [{ name: 'Unidad', price: 20 }],
  },
]

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug)
}

export function getProductsByCategory(slug) {
  return products.filter((p) => p.category === slug)
}

export function getProduct(id) {
  return products.find((p) => p.id === id)
}
