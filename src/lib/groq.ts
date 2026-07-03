export interface DetectedOrder {
  pickup: string
  dropoff: string
  description: string
  size: 'S' | 'M' | 'L'
  slotId?: string            // e.g. "s1416" — pre-selects time slot in step 4
  scheduleDay?: 'today' | 'tomorrow'
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
- Base prices: Small (envelope, documents) €5.00 · Medium (books, bag, groceries) €6.00 · Large (box, multiple items) €7.50
- Payment: cash on delivery or card
- To become a courier: must be a registered student, 18+, with a university email

TIME SLOTS & DYNAMIC PRICING:
Orders can be placed for "now" (immediate) or a specific 2-hour delivery window.
Each slot applies a price modifier to the base price:
- 08:00–10:00 (id: s0810): normal price
- 10:00–12:00 (id: s1012): normal price
- 12:00–14:00 (id: s1214): normal price
- 14:00–16:00 (id: s1416): −10% discount — cheapest option (günstig)
- 16:00–18:00 (id: s1618): −5% discount — affordable
- 18:00–20:00 (id: s1820): normal price
- 20:00–22:00 (id: s2022): +15% surcharge — late evening (Stoßzeit)
If a customer asks for the cheapest time → suggest 14:00–16:00 (−10%).
If a customer asks for the fastest/soonest → suggest "now" or the next available slot.

YOUR JOB:
1. Answer questions about Bringo briefly and warmly
2. Help customers place orders by collecting pickup address, dropoff address, and what the item is
3. Suggest the best time slot based on customer preferences (cheap, fast, convenient)

ORDER DETECTION:
When the customer clearly wants to place an order AND you know both pickup and dropoff, append this exact JSON at the very end of your response:
||ORDER||{"pickup":"<address>","dropoff":"<address>","description":"<item>","size":"<S|M|L>","slotId":"<slot-id or null>","scheduleDay":"<today|tomorrow|null>"}

Size guide: S = envelope/documents/small items · M = books/bag/groceries · L = large box/multiple heavy items. Default to M if unsure.
Set slotId to null for immediate "now" orders. Use slot ids from the list above.

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
            slotId: parsed.slotId && parsed.slotId !== 'null' ? parsed.slotId : undefined,
            scheduleDay: parsed.scheduleDay === 'today' || parsed.scheduleDay === 'tomorrow'
              ? parsed.scheduleDay : undefined,
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
