const KEY = 'bringo-session'

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
}
