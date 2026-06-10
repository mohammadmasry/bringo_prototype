const SHEETS_URL = import.meta.env.VITE_SHEETS_URL as string | undefined

export function logToSheets(type: string, data: Record<string, unknown>): void {
  console.log('[sheets] URL:', SHEETS_URL, 'type:', type)
  if (!SHEETS_URL) return
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ type, data, timestamp: new Date().toISOString() }),
  }).catch(() => {})
}
