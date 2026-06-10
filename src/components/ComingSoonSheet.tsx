import { useState } from 'react'
import { useLang } from '../hooks/useLang'
import { api } from '../lib/api'
import { logToSheets } from '../lib/sheets'

const tr = {
  de: {
    badge: 'Nur ein Prototyp',
    title: 'Diese Funktion\nkommt bald!',
    body: 'Die App befindet sich derzeit in der Entwicklung. Diese Funktion wird in der finalen Version vollständig verfügbar sein.',
    back: '← Zurück zur App',
    feedbackTitle: 'Wie gefällt Ihnen die App bisher?',
    feedbackSub: 'Ihr Feedback hilft uns, Bringo zu verbessern.',
    starsLabel: ['Sehr schlecht', 'Schlecht', 'Ok', 'Gut', 'Sehr gut'],
    likedLabel: 'Was gefällt Ihnen?',
    likedPh: 'z.B. das Design, die Idee, die Einfachheit…',
    improveLabel: 'Was kann verbessert werden?',
    improvePh: 'z.B. mehr Funktionen, andere Farben…',
    emailLabel: 'E-Mail für Rückmeldung',
    emailPh: 'optional',
    send: 'Feedback absenden',
    skip: 'Überspringen',
    sending: 'Wird gesendet…',
    thanks: 'Vielen Dank! 🎉',
    thanksSub: 'Ihr Feedback hilft uns, Bringo besser zu machen.',
  },
  en: {
    badge: 'Prototype only',
    title: 'This feature\nis coming soon!',
    body: 'The app is currently in development. This feature will be fully available in the final version.',
    back: '← Back to app',
    feedbackTitle: 'How do you like the app so far?',
    feedbackSub: 'Your feedback helps us improve Bringo.',
    starsLabel: ['Very bad', 'Bad', 'Ok', 'Good', 'Very good'],
    likedLabel: 'What do you like?',
    likedPh: 'e.g. the design, the idea, the simplicity…',
    improveLabel: 'What could be improved?',
    improvePh: 'e.g. more features, different colors…',
    emailLabel: 'Email for follow-up',
    emailPh: 'optional',
    send: 'Send feedback',
    skip: 'Skip',
    sending: 'Sending…',
    thanks: 'Thank you! 🎉',
    thanksSub: 'Your feedback helps us make Bringo better.',
  },
}

interface Props {
  onBack: () => void
  showFeedback?: boolean
  feedbackPage?: string
}

export default function ComingSoonSheet({ onBack, showFeedback = false, feedbackPage = '' }: Props) {
  const { lang } = useLang()
  const t = tr[lang]

  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [liked, setLiked] = useState('')
  const [improve, setImprove] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (stars === 0 || loading) return
    setLoading(true)
    logToSheets('feedback', { stars, liked, improve, email, page: feedbackPage })
    try {
      await api.feedback.submit({ stars, liked, improve, email, page: feedbackPage })
    } catch { /* backend optional */ }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col px-6 animate-fade-in-up"
      style={{ animationDuration: '0.35s' }}
    >
      <div
        className="fixed top-0 left-0 right-0 h-1.5"
        style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
      />

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pb-10 pt-12">
        {/* Coming soon card */}
        <div
          className="rounded-3xl p-7 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1.5px solid #bbf7d0' }}
        >
          <div className="inline-flex items-center gap-2 bg-green-600 text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {t.badge}
          </div>
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 whitespace-pre-line leading-tight">{t.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{t.body}</p>
        </div>

        {/* Feedback section */}
        {showFeedback && (
          <div className="rounded-2xl border border-gray-100 p-5 mb-5" style={{ background: '#fafafa' }}>
            {!submitted ? (
              <>
                <h2 className="text-base font-black text-gray-900 mb-1">{t.feedbackTitle}</h2>
                <p className="text-gray-400 text-xs mb-4">{t.feedbackSub}</p>

                {/* Stars */}
                <div className="flex gap-2 justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setStars(n)}
                      onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                      className="text-3xl transition-transform hover:scale-110">
                      <span style={{ color: n <= (hovered || stars) ? '#facc15' : '#e5e7eb' }}>★</span>
                    </button>
                  ))}
                </div>
                {stars > 0 && (
                  <p className="text-center text-xs font-semibold text-green-600 mb-4">{t.starsLabel[stars - 1]}</p>
                )}
                {stars === 0 && <div className="mb-4" />}

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.likedLabel}</label>
                    <textarea value={liked} onChange={(e) => setLiked(e.target.value)}
                      placeholder={t.likedPh} rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white resize-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.improveLabel}</label>
                    <textarea value={improve} onChange={(e) => setImprove(e.target.value)}
                      placeholder={t.improvePh} rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white resize-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.emailLabel}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPh}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white transition-colors" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSubmit} disabled={stars === 0 || loading}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: stars > 0 && !loading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
                      color: stars > 0 && !loading ? 'white' : '#9ca3af',
                      boxShadow: stars > 0 && !loading ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
                    }}>
                    {loading ? t.sending : t.send}
                  </button>
                  <button onClick={() => setSubmitted(true)}
                    className="px-4 py-3.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    {t.skip}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-3">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-base font-black text-gray-900 mb-1">{t.thanks}</h3>
                <p className="text-gray-400 text-xs">{t.thanksSub}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={onBack}
          className="w-full py-4 rounded-xl font-semibold text-base border-2 border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700 transition-all duration-200">
          {t.back}
        </button>
      </div>
    </div>
  )
}
