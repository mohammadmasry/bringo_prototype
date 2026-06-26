import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
        'Bringo supports people with groceries, pharmacy visits, restaurant orders, and everyday errands – local, fast, and straightforward.',
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
        'Bringo unterstützt Menschen bei Einkäufen, Apothekengängen, Restaurantbestellungen und alltäglichen Besorgungen – lokal, schnell und unkompliziert.',
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
      <div className="hidden md:flex md:w-[45%] relative flex-col justify-center p-10 lg:p-14 overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 space-y-6">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {intro.leftTitle1}
            <br />
            {intro.leftTitle2}
            <br />
            <span className="text-green-300">{intro.leftTitle3}</span>
          </h1>

          <p className="text-white/60 leading-relaxed max-w-md">{intro.leftDesc}</p>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 2" />
              </svg>
              <span className="text-sm text-white/70">{intro.time}</span>
            </div>
            <span className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-sm text-white/70">{intro.anonymous}</span>
            </div>
            <span className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              <span className="text-sm text-white/70">{intro.studentLed}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 lg:left-14 z-10 flex flex-col gap-2">
          <button
            onClick={() => (window.location.href = '/partner')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group w-fit"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75z" />
            </svg>
            <span className="text-base font-medium group-hover:underline underline-offset-2">
              {surveyLang === 'de' ? 'Für Geschäftspartner' : 'For business partners'}
            </span>
          </button>
          <button
            onClick={() => (window.location.href = '/courier-login')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group w-fit"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-base font-medium group-hover:underline underline-offset-2">
              {surveyLang === 'de' ? 'Als Kurier arbeiten' : 'Work as a courier'}
            </span>
          </button>
          <p className="text-white/20 text-xs mt-1">© 2026 Bringo · Germany</p>
        </div>
      </div>

      <div className="flex-1 bg-white min-h-screen flex items-start md:items-center justify-center px-5 py-6 md:py-10 overflow-x-hidden">
        <div className="w-full max-w-[520px]">
          <div className="flex items-center justify-end gap-3 mb-5 md:mb-8">
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
            <motion.div
              className="space-y-5 md:space-y-8"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              >
                <h1 className="font-black text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none mb-3 md:mb-5">
                  {intro.welcome}
                  <br />
                  <span className="shimmer-text">Bringo.</span>
                </h1>
                <p className="text-gray-500 text-base md:text-xl leading-relaxed whitespace-pre-line">{intro.desc}</p>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.687-7.148a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-800">{intro.groceries}</span>
                </div>
                <span className="hidden sm:block w-px h-4 bg-green-200" />
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <span className="text-sm font-semibold text-green-800">{intro.pharmacy}</span>
                </div>
                <span className="hidden sm:block w-px h-4 bg-green-200" />
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-800">{intro.errands}</span>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
                className="space-y-3"
              >
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 md:py-4 rounded-xl font-semibold text-white text-sm md:text-base"
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
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900">
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
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
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
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2">
                  {surveyLang === 'de' ? 'Was möchten Sie?' : 'What would you like?'}
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
                    {surveyLang === 'de' ? 'Einkaufen & Liefern' : 'Shopping + Delivery'}
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
                    {surveyLang === 'de' ? 'Nur Liefern' : 'Delivery'}
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
