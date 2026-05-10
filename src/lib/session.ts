const KEY = 'bringo-session'

interface Session {
  firstName?: string
  role?: 'courier' | 'customer'
}

export function getSession(): Session {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') }
  catch { return {} }
}

export function setSession(patch: Partial<Session>) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...getSession(), ...patch }))
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}
