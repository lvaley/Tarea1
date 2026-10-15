/* Textos y formatos de los pedidos (los valores internos coinciden con los de la API). */
export const STATUS_LABELS = {
  pendiente: 'Pendiente',
  preparando: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

/* Estados a los que puede pasar un pedido (el servidor es quien lo hace cumplir). */
export const NEXT_STATUSES = {
  pendiente: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
}

export const DELIVERY_LABELS = {
  recoger: 'Recoger en tienda',
  domicilio: 'Entrega a domicilio',
}

export const PAYMENT_LABELS = {
  efectivo: 'Efectivo al recibir',
  tarjeta: 'Tarjeta al recibir',
  transferencia: 'Transferencia bancaria',
}

export const money = (amount) => `Q${Number(amount).toFixed(2)}`

export const formatOrderDate = (iso) =>
  iso ? new Date(iso).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
