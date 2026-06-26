import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession } from '../lib/session'
import { api } from '../lib/api'
import { logToSheets } from '../lib/sheets'
import ComingSoonSheet from '../components/ComingSoonSheet'

type SurveyLang = 'en' | 'de'
type TextSize = 'normal' | 'large' | 'xl'

const surveyQuestions = {
  en: [
    {
      emoji: '👤',
      question: 'Who are you ordering for?',
      multi: true,
      options: ['For myself', 'For someone else'],
    },
    {
      emoji: '🎂',
      question: 'What is your age group?',
      multi: false,
      options: ['Under 18', '18 – 25', '26 – 35', '36 – 50', '51 – 70', '70+'],
    },
    {
      emoji: '🎓',
      question: 'Is it important to you that the couriers are registered students?',
      multi: false,
      options: ['Yes', "No, I don't care", "Don't know / No answer"],
    },
    {
      emoji: '💳',
      question: 'Which payment method would you prefer?',
      multi: true,
      options: ['Cash on delivery', 'EC card payment on delivery', 'SEPA Direct Debit', 'PayPal', 'Credit card', 'Other'],
    },
    {
      emoji: '📅',
      question: 'How often do you expect to use the service?',
      multi: false,
      options: ['Occasionally', 'Frequently', 'Once in a while / irregular', "I don't know yet"],
    },
    {
      emoji: '🛒',
      question: 'What type of orders would you like to process?',
      multi: true,
      options: [
        'Grocery shopping / Weekly shop',
        'Cooked dishes from restaurants',
        'Medicines / pharmacy visits',
        'Errands / services',
        'Individual items',
        'Other',
      ],
    },
    {
      emoji: '💚',
      question: 'How useful do you think a courier service like this is?',
      multi: false,
      options: [
        'Very useful – I would use it regularly',
        "Useful – I’d use it from time to time",
        'Not something I personally need, but I see the benefits',
        'Not appropriate / necessary',
        "I don't know",
      ],
    },
    {
      emoji: '📣',
      question: 'Would you recommend our service to others?',
      multi: false,
      options: ['Yes', 'Perhaps', 'No'],
    },
    {
      emoji: '💬',
      question: 'Do you have any further requests or comments?',
      multi: false,
      options: [],
      text: true,
    },
  ],
  de: [
    {
      emoji: '👤',
      question: 'Für wen bestellen Sie?',
      multi: true,
      options: ['Für mich selbst', 'Für jemand anderen'],
    },
    {
      emoji: '🎂',
      question: 'Welcher Altersgruppe gehören Sie an?',
      multi: false,
      options: ['Unter 18', '18 – 25', '26 – 35', '36 – 50', '51 – 70', '70+'],
    },
    {
      emoji: '🎓',
      question: 'Ist es Ihnen wichtig, dass die Kuriere zertifizierte Studierende sind?',
      multi: false,
      options: ['Ja', 'Nein, das ist mir egal', 'Weiß nicht / keine Angabe'],
    },
    {
      emoji: '💳',
      question: 'Welche Zahlungsart würden Sie bevorzugen?',
      multi: true,
      options: ['Barzahlung bei Übergabe', 'EC-Kartenzahlung bei Übergabe', 'SEPA-Lastschrift', 'PayPal', 'Kreditkarte', 'Andere'],
    },
    {
      emoji: '📅',
      question: 'Wie häufig würden Sie den Service voraussichtlich nutzen?',
      multi: false,
      options: ['Gelegentlich', 'Häufig', 'Vereinzelt / unregelmäßig', 'Weiß noch nicht'],
    },
    {
      emoji: '🛒',
      question: 'Welche Art von Bestellungen würden Sie abwickeln wollen?',
      multi: true,
      options: [
        'Lebensmitteleinkäufe / Wocheneinkauf',
        'Gekochtes Essen aus Restaurants',
        'Medikamente / Apothekengänge',
        'Besorgungen / Dienstleistungen',
        'Einzelposten',
        'Andere',
      ],
    },
    {
      emoji: '💚',
      question: 'Wie sinnvoll finden Sie einen solchen Kurier-Service?',
      multi: false,
      options: [
        'Sehr sinnvoll – ich würde ihn regelmäßig nutzen',
        'Sinnvoll – ich würde ihn gelegentlich nutzen',
        'Nicht notwendig für mich persönlich, aber ich sehe den Nutzen',
        'Nicht sinnvoll / erforderlich',
        'Weiß nicht',
      ],
    },
    {
      emoji: '📣',
      question: 'Würden Sie unseren Service weiterempfehlen?',
      multi: false,
      options: ['Ja', 'Vielleicht', 'Nein'],
    },
    {
      emoji: '💬',
      question: 'Haben Sie noch Wünsche oder Anmerkungen?',
      multi: false,
      options: [],
      text: true,
    },
  ],
}

function OnboardingFlow({ onLogin }: { onFinish?: () => void; onLogin: () => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [surveyLang, setSurveyLang] = useState<SurveyLang>('de')
  const [textSize, setTextSize] = useState<TextSize>('large')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [comment, setComment] = useState('')

  const introText = {
    en: {
      badge: 'Quick feedback',
      leftBadge: 'Service Survey',
      leftTitle1: 'Help shape',
      leftTitle2: 'local deliveries',
      leftTitle3: 'for real users.',
      leftDesc:
        'Your answers help us understand how Bringo should support people with groceries, pharmacy visits, restaurant orders, and everyday errands.',
      time: '2 minutes',
      anonymous: 'Anonymous',
      studentLed: 'Student-led',
      welcome: 'Welcome to',
      desc:
        'Bringo connects people who need help with local errands to verified student couriers nearby.\n\nBefore you sign up, we would like to ask a few quick questions so we can improve the service for real users.',
      groceries: 'Groceries',
      pharmacy: 'Deliveries',
      errands: 'Errands',
      start: 'Start survey →',
      skip: 'Skip and go to sign up',
      login: 'Log in',
      privacy: 'Your answers are anonymous and used only to improve Bringo.',
    },
    de: {
      badge: 'Kurzes Feedback',
      leftBadge: 'Service-Umfrage',
      leftTitle1: 'Helfen Sie uns,',
      leftTitle2: 'lokale Lieferungen',
      leftTitle3: 'besser zu gestalten.',
      leftDesc:
        'Ihre Antworten helfen uns zu verstehen, wie Bringo Menschen bei Einkäufen, Apothekengängen, Restaurantbestellungen und alltäglichen Besorgungen unterstützen kann.',
      time: '2 Minuten',
      anonymous: 'Anonym',
      studentLed: 'Von Studierenden',
      welcome: 'Willkommen bei',
      desc:
        'Bringo verbindet Menschen, die Hilfe bei lokalen Besorgungen brauchen, mit verifizierten studentischen Kurieren in der Nähe.\n\nBevor Sie sich anmelden, möchten wir ein paar kurze Fragen stellen, damit wir den Service verbessern können.',
      groceries: 'Einkäufe',
      pharmacy: 'Lieferungen',
      errands: 'Besorgungen',
      start: 'Umfrage starten →',
      skip: 'Überspringen und direkt zur Bestellung',
      login: 'Anmelden',
      privacy: 'Ihre Antworten sind anonym und werden nur zur Verbesserung von Bringo genutzt.',
    },
  }

  const intro = introText[surveyLang]

  const fontClass =
    textSize === 'normal' ? 'text-base' : textSize === 'large' ? 'text-lg' : 'text-xl'

  const q = surveyQuestions[surveyLang][questionIndex]

  const selectOption = (option: string) => {
    if (q.multi) {
      const current = Array.isArray(answers[questionIndex])
        ? (answers[questionIndex] as string[])
        : []
      setAnswers({
        ...answers,
        [questionIndex]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      })
    } else {
      setAnswers({ ...answers, [questionIndex]: option })
    }
  }

  const isSelected = (option: string) => {
    const answer = answers[questionIndex]
    return q.multi && Array.isArray(answer) ? answer.includes(option) : answer === option
  }

  return (
    <div
      className={`min-h-screen flex ${fontClass}`}
      style={{
        background: 'linear-gradient(150deg, #0d3d1e 0%, #14532d 35%, #166534 70%, #16a34a 100%)',
      }}
    >
      <div className="hidden md:flex md:w-[45%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">bringo</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex bg-white/10 border border-white/10 rounded-full px-4 py-2 text-green-200 text-xs font-semibold uppercase tracking-wide">
            {intro.leftBadge}
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            {intro.leftTitle1}
            <br />
            {intro.leftTitle2}
            <br />
            <span className="text-green-300">{intro.leftTitle3}</span>
          </h1>

          <p className="text-white/60 leading-relaxed max-w-md">{intro.leftDesc}</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 text-center text-white">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs text-white/70">{intro.time}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 text-center text-white">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs text-white/70">{intro.anonymous}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 text-center text-white">
              <div className="text-2xl mb-1">🎓</div>
              <p className="text-xs text-white/70">{intro.studentLed}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <button
            onClick={() => (window.location.href = '/partner')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm group w-fit"
          >
            <span>🏪</span>
            <span className="font-medium group-hover:underline underline-offset-2">
              {surveyLang === 'de' ? 'Für Geschäftspartner' : 'For business partners'}
            </span>
          </button>
          <button
            onClick={() => (window.location.href = '/courier-login')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm group w-fit"
          >
            <span>🚴</span>
            <span className="font-medium group-hover:underline underline-offset-2">
              {surveyLang === 'de' ? 'Als Kurier arbeiten' : 'Work as a courier'}
            </span>
          </button>
          <p className="text-white/20 text-xs mt-1">© 2026 Bringo · Germany</p>
        </div>
      </div>

      <div className="flex-1 bg-white min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[520px]">
          <div className="flex items-center justify-end gap-3 mb-8">
            <div
              className="inline-flex items-center bg-gray-100 rounded-full p-1 shadow-sm"
              role="group"
              aria-label="Language selection"
            >
              <button
                onClick={() => setSurveyLang('de')}
                aria-pressed={surveyLang === 'de'}
                aria-label="Auf Deutsch wechseln"
                className={`px-4 py-2 rounded-full font-bold transition ${
                  surveyLang === 'de' ? 'bg-white text-gray-900 shadow' : 'text-gray-400'
                }`}
              >
                🇩🇪 DE
              </button>
              <button
                onClick={() => setSurveyLang('en')}
                aria-pressed={surveyLang === 'en'}
                aria-label="Switch to English"
                className={`px-4 py-2 rounded-full font-bold transition ${
                  surveyLang === 'en' ? 'bg-white text-gray-900 shadow' : 'text-gray-400'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
            <button
              onClick={onLogin}
              className="px-5 py-2 rounded-full font-semibold text-sm border-2 border-green-600 text-green-700 hover:bg-green-50 transition-colors"
            >
              {intro.login}
            </button>
          </div>

          {step === 0 && (
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">
                  {intro.badge}
                </span>
              </div>

              <div>
                <h1 className="font-black text-gray-900 text-5xl lg:text-6xl leading-none mb-5">
                  {intro.welcome}
                  <br />
                  <span className="gradient-text">Bringo.</span>
                </h1>
                <p className="text-gray-500 text-xl leading-relaxed whitespace-pre-line">{intro.desc}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <div className="text-2xl mb-1">🛒</div>
                  <p className="text-sm font-semibold text-green-800">{intro.groceries}</p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-sm font-semibold text-green-800">{intro.pharmacy}</p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <p className="text-sm font-semibold text-green-800">{intro.errands}</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-xl font-semibold text-white text-base"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                }}
              >
                {intro.start}
              </button>

              <button
                onClick={() => setStep(5)}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-green-600 text-green-700 hover:bg-green-50 transition-colors"
              >
                {intro.skip}
              </button>

              <div className="pt-2 text-center">
                <a
                  href="/prototype"
                  className="text-xs text-gray-300 hover:text-green-600 transition-colors underline underline-offset-2"
                >
                  {surveyLang === 'de' ? 'Prototyp-Bericht ansehen' : 'View prototype report'}
                </a>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-gray-900">
                {surveyLang === 'de' ? 'Textgröße anpassen' : 'Adjust text size'}
              </h2>
              <p className="text-gray-500 text-lg">
                {surveyLang === 'de'
                  ? 'Wählen Sie die Textgröße, die für Sie am angenehmsten ist.'
                  : 'Choose the text size that feels most comfortable for you.'}
              </p>
              {(['normal', 'large', 'xl'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  aria-pressed={textSize === size}
                  className={`w-full border rounded-2xl p-5 text-left transition ${
                    textSize === size ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-green-50'
                  }`}
                >
                  <span className={size === 'normal' ? 'text-xl' : size === 'large' ? 'text-2xl' : 'text-3xl'}>
                    Aa
                  </span>
                  <span className="ml-4 font-bold">
                    {surveyLang === 'de'
                      ? size === 'normal'
                        ? 'Normal'
                        : size === 'large'
                        ? 'Groß'
                        : 'Extra groß'
                      : size === 'normal'
                      ? 'Normal'
                      : size === 'large'
                      ? 'Large'
                      : 'Extra Large'}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setStep(3)}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold"
              >
                {surveyLang === 'de' ? 'Weiter →' : 'Continue →'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{surveyLang === 'de' ? 'Frage' : 'Question'} {questionIndex + 1}</span>
                <span>{questionIndex + 1} / {surveyQuestions[surveyLang].length}</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2" role="progressbar"
                aria-valuenow={questionIndex + 1}
                aria-valuemin={1}
                aria-valuemax={surveyQuestions[surveyLang].length}
              >
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${((questionIndex + 1) / surveyQuestions[surveyLang].length) * 100}%` }}
                />
              </div>

              <div className="text-center space-y-3">
                <div className="text-5xl" aria-hidden="true">{q.emoji}</div>
                <h2 className="text-3xl font-black text-gray-900">{q.question}</h2>
                {q.multi && (
                  <p className="text-gray-400">
                    {surveyLang === 'de' ? 'Mehrfachauswahl möglich' : 'Multiple answers allowed'}
                  </p>
                )}
              </div>

              {q.text ? (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  aria-label={q.question}
                  className="w-full border border-gray-200 rounded-2xl p-4 min-h-40 outline-none focus:border-green-500"
                  placeholder={surveyLang === 'de' ? 'Schreiben Sie hier...' : 'Write your comment here...'}
                />
              ) : (
                <div className="space-y-3" role="group" aria-label={q.question}>
                  {q.options.map((option) => {
                    const selected = isSelected(option)
                    return (
                      <button
                        key={option}
                        onClick={() => selectOption(option)}
                        aria-pressed={selected}
                        className={`w-full border p-4 rounded-2xl text-left transition flex items-center gap-3 ${
                          selected
                            ? 'bg-green-50 border-green-500 text-green-900'
                            : 'border-gray-200 hover:bg-green-50 hover:border-green-200'
                        }`}
                      >
                        <span className="text-xl" aria-hidden="true">
                          {q.multi ? (selected ? '☑️' : '☐') : selected ? '●' : '○'}
                        </span>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => (questionIndex === 0 ? setStep(2) : setQuestionIndex(questionIndex - 1))}
                  className="w-1/2 border border-gray-200 py-3 rounded-xl font-semibold"
                >
                  {surveyLang === 'de' ? 'Zurück' : 'Back'}
                </button>
                <button
                  onClick={() => {
                    if (questionIndex === surveyQuestions[surveyLang].length - 1) {
                      api.surveys.create({ lang: surveyLang, answers: answers as Record<string, unknown> }).catch(console.error)
                      logToSheets('survey', { lang: surveyLang, answers })
                      setStep(4)
                    } else {
                      setQuestionIndex(questionIndex + 1)
                    }
                  }}
                  className="w-1/2 bg-green-600 text-white py-3 rounded-xl font-semibold"
                >
                  {surveyLang === 'de' ? 'Weiter' : 'Next'}
                </button>
              </div>

              <button onClick={() => setStep(5)} className="w-full text-green-700 underline font-medium">
                {surveyLang === 'de' ? 'Überspringen und direkt zur Bestellung' : 'Skip and go to order'}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-7">
              <div className="text-7xl" aria-hidden="true">✅</div>
              <h2 className="text-5xl font-black text-gray-900">
                {surveyLang === 'de' ? 'Vielen Dank!' : 'Thank you!'}
              </h2>
              <p className="text-gray-500 text-xl leading-relaxed">
                {surveyLang === 'de'
                  ? 'Ihr Feedback hilft uns, Bringo zu verbessern und die Bedürfnisse der Nutzer besser zu verstehen.'
                  : 'Your feedback helps us improve Bringo and understand what users need.'}
              </p>
              <button
                onClick={() => setStep(5)}
                className="w-full py-4 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                }}
              >
                {surveyLang === 'de' ? 'Weiter zur Bestellung →' : 'Continue to order →'}
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">
                  {surveyLang === 'de' ? 'Was möchten Sie bestellen?' : 'What would you like to order?'}
                </h2>
                <p className="text-gray-400 text-base">
                  {surveyLang === 'de' ? 'Wählen Sie eine Option:' : 'Choose an option:'}
                </p>
              </div>

              <button
                onClick={() => navigate('/easy-order')}
                className="w-full flex items-center gap-5 border-2 rounded-2xl p-5 text-left transition-all hover:border-green-500 hover:bg-green-50 group"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-3xl shrink-0 transition-colors">
                  🛒
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">
                    {surveyLang === 'de' ? 'Einkauf & Besorgungen' : 'Shopping & Errands'}
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {surveyLang === 'de'
                      ? 'Lebensmittel, Apotheke, Restaurant & mehr'
                      : 'Groceries, pharmacy, restaurant & more'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/create-delivery')}
                className="w-full flex items-center gap-5 border-2 rounded-2xl p-5 text-left transition-all hover:border-green-500 hover:bg-green-50 group"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-3xl shrink-0 transition-colors">
                  📦
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">
                    {surveyLang === 'de' ? 'Abholung & Lieferung' : 'Pickup & Delivery'}
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {surveyLang === 'de'
                      ? 'Pakete, Dokumente, persönliche Gegenstände'
                      : 'Packages, documents, personal items'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { clearSession() }, [])

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onFinish={() => navigate('/create-delivery')}
        onLogin={() => setShowOnboarding(false)}
      />
    )
  }

  return <ComingSoonSheet onBack={() => setShowOnboarding(true)} />
}
