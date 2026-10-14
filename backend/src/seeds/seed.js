import { readFile } from 'node:fs/promises'
import env from '../config/env.js'
import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Banner from '../models/Banner.js'

/**
 * Datos iniciales. Son los mismos que antes vivían en el código del frontend
 * (usuarios de prueba, productos y banners del Home), ahora guardados en MongoDB.
 *
 * El seed es repetible: si un registro ya existe NO lo duplica ni lo modifica,
 * así que puedes ejecutarlo de nuevo sin perder lo que edites desde el panel.
 */
const users = [
  {
    name: 'Luis Valey',
    email: 'luis@nekocoffee.com',
    password: '12345678',
    role: 'admin',
    membership: 'Administrador',
  },
  {
    name: 'Sora Kimura',
    email: 'cliente@nekocoffee.com',
    password: '12345678',
    role: 'cliente',
    membership: 'Cliente frecuente',
  },
]

const readJson = async (file) =>
  JSON.parse(await readFile(new URL(file, import.meta.url), 'utf-8'))

async function seedCollection(label, items, existsQuery, Model) {
  console.log(`\n${label}`)
  let created = 0
  for (const data of items) {
    const query = existsQuery(data)
    if (await Model.exists(query)) {
      console.log(`  ↩️  Ya existe: ${Object.values(query)[0]}`)
      continue
    }
    await Model.create(data)
    created++
    console.log(`  ✅ Creado: ${Object.values(query)[0]}`)
  }
  return created
}

async function seed() {
  await connectDB()

  await seedCollection('Usuarios', users, (u) => ({ email: u.email }), User)
  await seedCollection('Productos', await readJson('./products.json'), (p) => ({ slug: p.slug }), Product)
  await seedCollection('Banners del Home', await readJson('./banners.json'), (b) => ({ title: b.title }), Banner)

  await disconnectDB()
  console.log(`\nSeed terminado en ${env.nodeEnv}.`)
}

seed().catch(async (error) => {
  console.error(`\n❌ ${error.message}\n`)
  await disconnectDB().catch(() => {})
  process.exit(1)
})
