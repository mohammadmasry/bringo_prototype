export interface DetectedOrder {
  pickup: string
  dropoff: string
  description: string
  size: 'S' | 'M' | 'L'
}

export interface GroqMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are the Bringo assistant — a friendly helper for a student-run peer-to-peer delivery service in Pfarrkirchen, Germany.

ABOUT BRINGO:
- Service area: Pfarrkirchen and surroundings (~5 km radius)
- Couriers: verified university students only
- Average delivery time: ~25 minutes
- Prices: Small (envelope, documents) €3.20 · Medium (books, bag, groceries) €4.50 · Large (box, multiple items) €5.80
- Payment: cash on delivery or card
- To become a courier: must be a registered student, 18+, with a university email

YOUR JOB:
1. Answer questions about Bringo briefly and warmly
2. Help customers place orders by collecting pickup address, dropoff address, and what the item is

ORDER DETECTION:
When the customer clearly wants to place an order AND you know both pickup and dropoff, append this exact line at the very end of your response:
||ORDER||{"pickup":"<address>","dropoff":"<address>","description":"<item>","size":"<S|M|L>"}

Size guide: S = envelope/documents/small items · M = books/bag/groceries · L = large box/multiple heavy items. Default to M if unsure.

Rules:
- Reply in the same language the customer uses (German or English)
- Keep answers to 1–2 sentences unless a detailed explanation is needed
- Be warm, helpful, and concise`

export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return 'Einkaufszettel-Analyse nicht konfiguriert (Groq API Key fehlt).'
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This is a photo of a shopping list or products. List all visible items clearly. If the text is German, reply in German; otherwise reply in English. Just list the items, one per line, no extra commentary.',
            },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        }],
        max_tokens: 400,
      }),
    })
    if (!res.ok) return 'Bild konnte nicht analysiert werden.'
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? 'Keine Elemente erkannt.'
  } catch {
    return 'Verbindungsfehler beim Analysieren des Bildes.'
  }
}

export async function askGroq(
  messages: GroqMessage[]
): Promise<{ text: string; order: DetectedOrder | null }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return {
      text: '⚙️ AI assistant not configured yet — add your Groq API key to .env.local to activate.',
      order: null,
    }
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 350,
        temperature: 0.5,
      }),
    })

    if (!res.ok) return { text: 'Something went wrong. Please try again.', order: null }

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ''

    const orderMatch = raw.match(/\|\|ORDER\|\|\s*(\{[\s\S]*?\})/)
    let order: DetectedOrder | null = null
    if (orderMatch) {
      try {
        const parsed = JSON.parse(orderMatch[1])
        if (parsed.pickup && parsed.dropoff) {
          order = {
            pickup: parsed.pickup,
            dropoff: parsed.dropoff,
            description: parsed.description || '',
            size: (['S', 'M', 'L'] as const).includes(parsed.size) ? parsed.size : 'M',
          }
        }
      } catch {}
    }

    const text = raw.replace(/\|\|ORDER\|\|\s*\{[\s\S]*?\}/, '').trim()
    return { text, order }
  } catch {
    return { text: 'Connection error. Please check your internet and try again.', order: null }
  }
}
