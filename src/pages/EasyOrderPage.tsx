import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { getSession } from '../lib/session'
import { askGroq, type DetectedOrder, type GroqMessage } from '../lib/groq'

interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
  order?: DetectedOrder | null
}

const PRICES: Record<'S' | 'M' | 'L', number> = { S: 3.2, M: 4.5, L: 5.8 }

const tr = {
  de: {
    back: 'Zurück',
    heading: 'Was darf ich für Sie tun?',
    sub: 'Beschreiben Sie einfach, was Sie brauchen - ich erledige den Rest.',
    placeholder: 'z.B. "Ich brauche Medikamente von der Apotheke…"',
    send: 'Senden',
    confirm: 'Ja, so bestellen →',
    pickup: 'Abholung',
    dropoff: 'Zielort',
    price: 'Preis',
    manualLink: 'Lieber selbst ausfüllen?',
    welcome: 'Hallo! 👋 Ich bin Ihr Bringo-Assistent.\n\nSagen Sie mir einfach, was abgeholt und wohin geliefert werden soll — zum Beispiel:\n\n„Medikamente von der Apotheke am Stadtplatz zu mir nach Hause, Ludwigstraße 8"',
  },
  en: {
    back: 'Back',
    heading: 'What can I help you with?',
    sub: "Just describe what you need - I'll take care of the rest.",
    placeholder: 'e.g. "I need medicine from the pharmacy…"',
    send: 'Send',
    confirm: 'Yes, place this order →',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    price: 'Price',
    manualLink: 'Prefer to fill in the form yourself?',
    welcome: "Hello! 👋 I'm your Bringo assistant.\n\nJust tell me what needs to be picked up and where it should be delivered — for example:\n\n\"Pick up medicine from the pharmacy at Stadtplatz and bring it to me at Ludwigstraße 8\"",
  },
}

function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-5 py-4 bg-white rounded-2xl rounded-tl-sm border border-gray-100 self-start shadow-sm w-24">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-3 h-3 rounded-full bg-gray-300 inline-block"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

export default function EasyOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang] ?? tr.de
  const { firstName = '' } = (location.state as { firstName?: string } | null) ?? getSession()

  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: t.welcome },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMsg = { role: 'user', text }
    const history: GroqMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.text,
    }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    const { text: aiText, order } = await askGroq(history)
    setMessages((prev) => [...prev, { role: 'assistant', text: aiText, order }])
    setIsLoading(false)
  }

  const handleConfirm = (order: DetectedOrder) => {
    navigate('/create-delivery', {
      state: { firstName, prefill: order },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-gray-100 shrink-0">
        <button
          onClick={() => navigate('/home/customer', { state: { firstName } })}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-base font-medium">{t.back}</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-800">Bringo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 max-w-xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`text-xl leading-relaxed rounded-2xl px-6 py-4 max-w-[88%] whitespace-pre-line shadow-sm ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
              }`}
            >
              {msg.text}

              {/* Order confirmation card */}
              {msg.order && (
                <div className="mt-5 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center pt-1 shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                        <div className="w-px flex-1 my-2 border-l-2 border-dashed border-gray-300" style={{ minHeight: 24 }} />
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        <div>
                          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{t.pickup}</p>
                          <p className="text-lg font-semibold text-gray-900 leading-tight">{msg.order.pickup}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{t.dropoff}</p>
                          <p className="text-lg font-semibold text-gray-900 leading-tight">{msg.order.dropoff}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-lg text-gray-600">{msg.order.description}</p>
                      <p className="text-2xl font-black text-gray-900">€{PRICES[msg.order.size].toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirm(msg.order!)}
                    className="w-full py-5 text-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                  >
                    {t.confirm}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-4 max-w-xl mx-auto w-full">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder={t.placeholder}
            rows={2}
            className="flex-1 px-5 py-4 rounded-2xl border-2 text-xl outline-none bg-gray-50 text-gray-900 placeholder-gray-300 resize-none transition-colors leading-snug"
            style={{ borderColor: input.length > 0 ? '#16a34a' : '#e5e7eb' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0"
            style={{
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(22,163,74,0.35)' : 'none',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke={input.trim() && !isLoading ? 'white' : '#9ca3af'}
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => navigate('/create-delivery', { state: { firstName } })}
          className="mt-3 w-full text-center text-base text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          {t.manualLink}
        </button>
      </div>
    </div>
  )
}
