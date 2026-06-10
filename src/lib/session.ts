const KEY = 'bringo-session'
const TOKEN_KEY = 'bringo-token'

interface Session {
  firstName?: string
  role?: 'courier' | 'customer'
  mode?: 'standard' | 'easy'
}

export function getSession(): Session {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  catch { return {} }
}

export function setSession(patch: Partial<Session>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getSession(), ...patch }))
}

export function clearSession() {
  localStorage.removeItem(KEY)
  localStorage.removeItem('bringo-active-order')
  localStorage.removeItem('bringo-order-history')
  clearToken()
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}
