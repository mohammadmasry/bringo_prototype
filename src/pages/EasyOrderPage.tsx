import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { getSession } from '../lib/session'
import { askGroq, analyzeImage, type DetectedOrder, type GroqMessage } from '../lib/groq'
import { api } from '../lib/api'

interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
  order?: DetectedOrder | null
  isImage?: boolean
}

interface OrderItem {
  id: string
  name: string
  qty: number
}

const PRICES: Record<'S' | 'M' | 'L', number> = { S: 3.2, M: 4.5, L: 5.8 }
const TEMPLATE_KEY = 'bringo_order_template'
const LAST_ORDER_KEY = 'bringo_last_order'

interface LastOrder { pickup: string; dropoff: string; description: string; size: 'S' | 'M' | 'L' }

function saveLastOrder(o: LastOrder) { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(o)) }
function loadLastOrder(): LastOrder | null {
  try { const d = localStorage.getItem(LAST_ORDER_KEY); return d ? JSON.parse(d) : null }
  catch { return null }
}

function parseItems(description: string): OrderItem[] {
  const parts = description.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean)
  return parts.map((part, i) => {
    let name = part
    let qty = 1
    const prefix = part.match(/^(\d+)\s*[x×]\s*(.+)/i)
    if (prefix) { qty = parseInt(prefix[1]); name = prefix[2] }
    else {
      const suffix = part.match(/^(.+?)\s*[x×]\s*(\d+)$/i)
      if (suffix) { qty = parseInt(suffix[2]); name = suffix[1] }
      else {
        const paren = part.match(/^(.+?)\s*\((\d+)\)$/)
        if (paren) { qty = parseInt(paren[2]); name = paren[1] }
      }
    }
    return { id: `${i}-${part}`, name: name.trim(), qty }
  })
}

function saveTemplate(items: OrderItem[]) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(items))
}



const tr = {
  de: {
    back: 'Zurück',
    placeholder: 'Tippen Sie Ihre Bestellung…',
    send: 'Senden',
    confirm: 'Ja, so bestellen →',
    pickup: 'Abholung',
    dropoff: 'Zielort',
    price: 'Preis',
    manualLink: 'Lieber selbst ausfüllen?',
    categoryHint: 'Oder wählen Sie eine Kategorie:',
    repeatOrder: 'Letzten Einkauf wiederholen?',
    addItem: '+ Artikel hinzufügen',
    itemsTitle: 'Bestellliste bearbeiten',
    welcome: 'Was benötigen Sie?\n\nSie können eintippen, Ihren Einkaufszettel oder Produkte abfotografieren oder Ihre Bestellung einsprechen.',
    analyzing: '🔍 Bild wird analysiert…',
    photoPrefix: '📷 Foto-Einkaufszettel:\n',
    voiceNotSupported: 'Sprachaufnahme wird von Ihrem Browser nicht unterstützt.',
    listening: 'Höre zu…',
    micStart: 'Bestellung einsprechen',
    cameraLabel: 'Foto aufnehmen',
  },
  en: {
    back: 'Back',
    placeholder: 'Type your order…',
    send: 'Send',
    confirm: 'Yes, place this order →',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    price: 'Price',
    manualLink: 'Prefer to fill in the form yourself?',
    categoryHint: 'Or choose a category:',
    repeatOrder: 'Repeat last order?',
    addItem: '+ Add item',
    itemsTitle: 'Edit order list',
    welcome: 'What do you need?\n\nYou can type, photograph your shopping list or products, or speak your order.',
    analyzing: '🔍 Analysing image…',
    photoPrefix: '📷 Photo shopping list:\n',
    voiceNotSupported: 'Voice recording is not supported by your browser.',
    listening: 'Listening…',
    micStart: 'Speak your order',
    cameraLabel: 'Take a photo',
  },
}

function BotAvatar() {
  return (
    <div
      className="w-10 h-10 rounded-full shrink-0 mt-1 overflow-hidden shadow-sm border border-green-100"
      style={{ background: '#f0fdf4' }}
      aria-hidden="true"
    >
      <img
        src="/bot-avatar.avif"
        alt=""
        className="w-full h-full object-cover"
        style={{ filter: 'hue-rotate(-120deg) saturate(1.3) brightness(1.05)' }}
      />
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2">
      <BotAvatar />
      <div className="flex items-center gap-2 px-5 py-4 bg-white rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm w-24">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-3 h-3 rounded-full bg-gray-300 inline-block"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
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
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [voiceError, setVoiceError] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentItems, setCurrentItems] = useState<OrderItem[] | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const [savedLastOrder, setSavedLastOrder] = useState<LastOrder | null>(null)
  useEffect(() => { setSavedLastOrder(loadLastOrder()) }, [])

  const [currentPickup, setCurrentPickup] = useState<string | null>(null)
  const [currentDropoff, setCurrentDropoff] = useState<string | null>(null)

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.order) {
      setCurrentItems(parseItems(last.order.description))
      setCurrentPickup(last.order.pickup)
      setCurrentDropoff(last.order.dropoff)
    }
  }, [messages])

  // Create a conversation record on mount
  useEffect(() => {
    api.conversations.create(lang).then((r) => setConversationId(r.id)).catch(() => {})
  }, [lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isAnalyzing])

  const saveMessage = (role: string, inputType: string, content: string) => {
    if (!conversationId) return
    api.conversations.addMessage(conversationId, { role, inputType, content }).catch(() => {})
  }

  // ── Text send ──────────────────────────────────────────────────────────────
  const send = async (overrideText?: string, inputType: 'text' | 'voice' = 'text') => {
    const text = (overrideText ?? input).trim()
    if (!text || isLoading) return

    const userMsg: ChatMsg = { role: 'user', text }
    const history: GroqMessage[] = [...messages, userMsg]
      .filter((m) => !m.isImage)
      .map((m) => ({ role: m.role, content: m.text }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    saveMessage('user', inputType, text)

    const { text: aiText, order } = await askGroq(history)
    setMessages((prev) => [...prev, { role: 'assistant', text: aiText, order }])
    saveMessage('assistant', 'text', aiText)
    setIsLoading(false)
  }

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setIsAnalyzing(true)
    setMessages((prev) => [...prev, { role: 'user', text: t.analyzing, isImage: true }])

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'

      const itemList = await analyzeImage(base64, mimeType)
      const userText = `${t.photoPrefix}${itemList}`

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'user', text: userText, isImage: true }
        return updated
      })
      setIsAnalyzing(false)
      setIsLoading(true)
      saveMessage('user', 'image', userText)

      const history: GroqMessage[] = [
        ...messages.filter((m) => !m.isImage).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text })),
        { role: 'user' as const, content: userText },
      ]
      const { text: aiText, order } = await askGroq(history)
      setMessages((prev) => [...prev, { role: 'assistant', text: aiText, order }])
      saveMessage('assistant', 'text', aiText)
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // ── Voice recording ────────────────────────────────────────────────────────
  const toggleVoice = () => {
    type SR = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }
    const win = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
    const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) { setVoiceError(true); setTimeout(() => setVoiceError(false), 3500); return }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = lang === 'de' ? 'de-DE' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = (event.results[0] as ArrayLike<{ transcript: string }>)[0]?.transcript ?? ''
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        // auto-send voice transcript immediately
        send(transcript, 'voice')
      }
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const handleConfirm = (order: DetectedOrder) => {
    const items = currentItems ?? parseItems(order.description)
    saveTemplate(items)
    const pickup = currentPickup ?? order.pickup
    const dropoff = currentDropoff ?? order.dropoff
    const description = items.map(it => `${it.qty > 1 ? `${it.qty}x ` : ''}${it.name}`).join(', ')
    saveLastOrder({ pickup, dropoff, description, size: order.size })
    navigate('/create-delivery', { state: { firstName, fromAI: true, prefill: { ...order, pickup, dropoff, description }, conversationId } })
  }

  const updateItem = (id: string, patch: Partial<OrderItem>) =>
    setCurrentItems(prev => prev?.map(it => it.id === id ? { ...it, ...patch } : it) ?? null)

  const removeItem = (id: string) =>
    setCurrentItems(prev => prev?.filter(it => it.id !== id) ?? null)

  const addItem = () =>
    setCurrentItems(prev => prev ? [...prev, { id: `new-${Date.now()}`, name: '', qty: 1 }] : null)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-gray-100 shrink-0">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
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
          <div key={i} className={`flex ${msg.role === 'user' ? 'flex-col items-end' : 'flex-row items-start gap-2'}`}>
            {msg.role === 'assistant' && <BotAvatar />}
            <div className={`text-xl leading-relaxed rounded-2xl px-6 py-4 max-w-[85%] whitespace-pre-line shadow-sm ${
              msg.role === 'user'
                ? 'bg-green-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
            } ${msg.isImage ? 'opacity-80 italic text-base' : ''}`}>
              {msg.text}

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
                          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.pickup}</p>
                          {i === messages.length - 1 ? (
                            <input
                              value={currentPickup ?? msg.order.pickup}
                              onChange={e => setCurrentPickup(e.target.value)}
                              className="w-full text-base font-semibold text-gray-900 bg-transparent border-b-2 outline-none py-0.5 transition-colors"
                              style={{ borderColor: (currentPickup ?? msg.order.pickup) ? '#16a34a' : '#f59e0b' }}
                            />
                          ) : (
                            <p className="text-base font-semibold text-gray-900 leading-tight">{msg.order.pickup}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.dropoff}</p>
                          {i === messages.length - 1 ? (
                            <input
                              value={currentDropoff ?? msg.order.dropoff}
                              onChange={e => setCurrentDropoff(e.target.value)}
                              className="w-full text-base font-semibold text-gray-900 bg-transparent border-b-2 outline-none py-0.5 transition-colors"
                              style={{ borderColor: (currentDropoff ?? msg.order.dropoff) ? '#16a34a' : '#f59e0b' }}
                            />
                          ) : (
                            <p className="text-base font-semibold text-gray-900 leading-tight">{msg.order.dropoff}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">{t.itemsTitle}</p>
                      <div className="space-y-1.5">
                        {(i === messages.length - 1 && currentItems ? currentItems : parseItems(msg.order.description)).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                              <button onClick={() => updateItem(item.id, { qty: Math.max(1, item.qty - 1) })}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-base font-bold">−</button>
                              <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                              <button onClick={() => updateItem(item.id, { qty: item.qty + 1 })}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-base font-bold">+</button>
                            </div>
                            <input
                              value={item.name}
                              onChange={e => updateItem(item.id, { name: e.target.value })}
                              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-b border-gray-200 focus:border-green-500 outline-none py-0.5"
                            />
                            <button onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-400 shrink-0 text-lg leading-none">×</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={addItem}
                        className="mt-2 text-sm text-green-600 font-semibold hover:text-green-700">
                        {t.addItem}
                      </button>
                      <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                        <p className="text-2xl font-black text-gray-900">€{PRICES[msg.order.size].toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleConfirm(msg.order!)}
                    className="w-full py-5 text-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                    {t.confirm}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {messages.length === 1 && savedLastOrder && (
          <button
            onClick={() => navigate('/create-delivery', {
              state: { firstName, fromAI: true, prefill: savedLastOrder, conversationId }
            })}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:border-green-400 transition-all"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            {t.repeatOrder}
          </button>
        )}

        {(isLoading || isAnalyzing) && <TypingDots />}
        <div ref={bottomRef} />
      </div>


      {/* Voice not supported toast */}
      {voiceError && (
        <div className="shrink-0 max-w-xl mx-auto w-full px-5 pb-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" className="shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {t.voiceNotSupported}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-4 max-w-xl mx-auto w-full">
        <div className="flex gap-2 items-end">

          {/* Camera button */}
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handlePhotoSelect} />
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={isLoading || isAnalyzing}
            title={t.cameraLabel}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 disabled:opacity-40"
          >
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </button>

          {/* Mic button */}
          <button
            onClick={toggleVoice}
            disabled={isLoading || isAnalyzing}
            title={t.micStart}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 disabled:opacity-40"
            style={{
              borderColor: isRecording ? '#dc2626' : '#e5e7eb',
              background: isRecording ? '#fef2f2' : 'white',
            }}
          >
            {isRecording ? (
              <span className="w-4 h-4 rounded-full bg-red-500" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
            ) : (
              <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Text input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={isRecording ? t.listening : t.placeholder}
            rows={2}
            className="flex-1 px-5 py-3 rounded-2xl border-2 text-lg outline-none bg-gray-50 text-gray-900 placeholder-gray-300 resize-none transition-colors leading-snug"
            style={{ borderColor: input.length > 0 ? '#16a34a' : isRecording ? '#dc2626' : '#e5e7eb' }}
          />

          {/* Send button */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || isLoading || isAnalyzing}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0"
            style={{
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(22,163,74,0.35)' : 'none',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke={input.trim() && !isLoading ? 'white' : '#9ca3af'} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
