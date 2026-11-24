export const statuses = {
  pending: 'Menunggu pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
} as const

export type OrderStatus = keyof typeof statuses

export type Order = {
  code: string
  gameId?: string
  packId?: string
  methodId?: string
  game: string
  nominal: string
  method: string
  subtotal: number
  fee: number
  total: number
  status: OrderStatus
}

const storageKey = 'mikoo-store.orders.v1'

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false
  const order = value as Record<string, unknown>
  return ['code', 'game', 'nominal', 'method'].every((key) => typeof order[key] === 'string')
    && ['subtotal', 'fee', 'total'].every((key) => Number.isSafeInteger(order[key]))
    && typeof order.status === 'string'
    && Object.hasOwn(statuses, order.status)
}

export function readOrders() {
  const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  if (!Array.isArray(saved)) throw new Error('Format pesanan tidak dikenal')
  return saved.filter(isOrder)
}

export function createOrder(details: Omit<Order, 'code' | 'status'>) {
  const orders = readOrders()
  let code: string
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    code = `MKO-${suffix.toUpperCase()}`
  } while (orders.some((order) => order.code === code))

  const order: Order = { ...details, code, status: 'pending' }
  localStorage.setItem(storageKey, JSON.stringify([order, ...orders]))
  return order
}

export function changeStatus(code: string, status: OrderStatus) {
  const orders = readOrders()
  const order = orders.find((entry) => entry.code === code)
  if (!order) throw new Error('Pesanan tidak ditemukan')
  order.status = status
  localStorage.setItem(storageKey, JSON.stringify(orders))
  return order
}
