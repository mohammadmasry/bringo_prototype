const ACTIVE_KEY = 'bringo-active-order'
const HISTORY_KEY = 'bringo-order-history'

export interface StoredOrder {
  id: string
  pickup: string
  dropoff: string
  description: string
  size: 'S' | 'M' | 'L'
  price: number
  note?: string
  status: 'searching' | 'found' | 'heading_to_pickup' | 'picked_up' | 'delivered'
}

export function getActiveOrder(): StoredOrder | null {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) ?? 'null') }
  catch { return null }
}

export function setActiveOrder(order: StoredOrder | null) {
  if (order) localStorage.setItem(ACTIVE_KEY, JSON.stringify(order))
  else localStorage.removeItem(ACTIVE_KEY)
}

export function getOrderHistory(): StoredOrder[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') }
  catch { return [] }
}

export function addToHistory(order: StoredOrder) {
  const history = getOrderHistory()
  history.unshift({ ...order, status: 'delivered' })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)))
}
