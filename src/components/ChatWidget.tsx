import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../hooks/useLang'
import { askGroq, type DetectedOrder, type GroqMessage } from '../lib/groq'

interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
  order?: DetectedOrder | null
}

const WELCOME: Record<string, string> = {
  de: 'Hallo! 👋 Ich bin der Bringo-Assistent. Frag mich alles zum Service — oder sag mir einfach, was du geliefert haben möchtest!',
  en: "Hi! 👋 I'm the Bringo assistant. Ask me anything about the service — or just tell me what you need picked up and delivered!",
}

const tr = {
  de: {
    placeholder: 'Schreib etwas…',
    createOrder: 'Bestellung aufgeben →',
    pickup: 'Abholung',
    dropoff: 'Zielort',
    item: 'Artikel',
    price: 'Preis',
    title: 'Bringo Assistent',
    subtitle: 'Immer für dich da',
    typing: 'tippt…',
  },
  en: {
    placeholder: 'Ask me anything…',
    createOrder: 'Create this order →',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    item: 'Item',
    price: 'Price',
    title: 'Bringo Assistant',
    subtitle: 'Always here to help',
    typing: 'typing…',
  },
}

const PRICES: Record<'S' | 'M' | 'L', number> = { S: 3.2, M: 4.5, L: 5.8 }

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 inline-block"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onConfirm,
  t,
}: {
  order: DetectedOrder
  onConfirm: () => void
  t: (typeof tr)['en']
}) {
  return (
    <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2.5 mb-3">
          <div className="flex flex-col items-center pt-0.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="w-px flex-1 my-1 border-l border-dashed border-gray-300" style={{ minHeight: 16 }} />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.pickup}</p>
              <p className="text-xs font-medium text-gray-800 leading-tight">{order.pickup}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.dropoff}</p>
              <p className="text-xs font-medium text-gray-800 leading-tight">{order.dropoff}</p>
            </div>
          </div>
        </div>
        {order.description && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">{order.description}</p>
            <span className="text-sm font-black text-gray-900 ml-2">
              €{PRICES[order.size].toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onConfirm}
        className="w-full py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
      >
        {t.createOrder}
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}

export default function ChatWidget({ firstName }: { firstName?: string }) {
  const { lang } = useLang()
  const t = tr[lang] ?? tr.en
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: WELCOME[lang] ?? WELCOME.en },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

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

    if (!isOpen) setHasUnread(true)
  }

  const handleCreateOrder = (order: DetectedOrder) => {
    setIsOpen(false)
    navigate('/create-delivery', {
      state: { firstName, prefill: order },
    })
  }

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-4 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              width: 'min(22rem, calc(100vw - 2rem))',
              maxHeight: '72vh',
              border: '1px solid #e5e7eb',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)' }}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-none">{t.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 pulse-dot" />
                  <p className="text-xs text-green-200">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f9fafb' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.text}
                    {msg.order && (
                      <OrderCard
                        order={msg.order}
                        onConfirm={() => handleCreateOrder(msg.order!)}
                        t={t}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder={t.placeholder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white transition-colors"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
                  style={{
                    background:
                      input.trim() && !isLoading
                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                        : '#f3f4f6',
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={input.trim() && !isLoading ? 'white' : '#9ca3af'}
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
        style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </motion.button>
    </>
  )
}
