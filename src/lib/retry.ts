interface RetryOptions {
  attempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  { attempts = 3, baseDelayMs = 300, maxDelayMs = 5000 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === attempts) break

      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      console.warn(`[${label}] attempt ${attempt}/${attempts} failed, retrying in ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  console.error(`[${label}] failed after ${attempts} attempts`)
  throw lastError
}
