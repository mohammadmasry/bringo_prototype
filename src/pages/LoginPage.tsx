import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { clearSession } from '../lib/session'

type SurveyLang = 'en' | 'de'
type TextSize = 'normal' | 'large' | 'xl'

const translations = {
  de: {
    badge: 'Jetzt verfügbar in Deutschland',
    h1: 'Anmelden',
    h2: 'oder beitreten.',
    subtitle: 'Lokale Lieferungen von verifizierten Studierenden.',
    phoneLabel: 'Deutsche Handynummer',
    continue: 'Weiter',
    leftH1a: 'Lokale Lieferungen',
    leftH1b: 'von verifizierten',
    leftH1c: 'Studierenden.',
    leftSub: 'Schnell, vertrauenswürdig, günstig — getragen von deiner Uni-Community.',
    activeDelivery: 'Aktive Lieferung',
    f1: 'Nur verifizierte Studierende',
    f2: 'Live-GPS-Tracking',
    f3: 'Direkter Kontakt zum Kurier',
    footer: '© 2026 Bringo · Deutschland',
  },
  en: {
    badge: 'Now live in Germany',
    h1: 'Login',
    h2: 'or join.',
    subtitle: 'Local deliveries by verified students.',
    phoneLabel: 'German phone number',
    continue: 'Continue',
    leftH1a: 'Local deliveries',
    leftH1b: 'by verified',
    leftH1c: 'students.',
    leftSub: 'Fast, trusted, affordable — powered by your university community.',
    activeDelivery: 'Active Delivery',
    f1: 'Verified university students only',
    f2: 'Live GPS tracking',
    f3: 'Direct courier contact',
    footer: '© 2026 Bringo · Germany',
  },
}

const surveyQuestions = {
  en: [
    {
      emoji: '👤',
      question: 'Who are you?',
      multi: false,
      options: [
        'I am under 70 and would like to place an order for myself',
        'I am 70 or over and would like to place an order for myself',
        'I am a relative / carer and would like to book the service for someone else',
      ],
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
      options: ['Cash on delivery', 'SEPA Direct Debit', 'PayPal', 'Credit card', 'Other'],
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
        'Useful – I’d use it from time to time',
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
      question: 'Wer sind Sie?',
      multi: false,
      options: [
        'Ich bin unter 70 Jahre alt und möchte für mich bestellen',
        'Ich bin 70 Jahre oder älter und möchte für mich bestellen',
        'Ich bin Angehörige / Pflegende und würde den Service für andere buchen',
      ],
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
      options: ['Barzahlung bei Übergabe', 'SEPA-Lastschrift', 'PayPal', 'Kreditkarte', 'Andere'],
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

function OnboardingFlow({ onFinish }: { onFinish: () => void }) {
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
      pharmacy: 'Pharmacy',
      errands: 'Errands',
      start: 'Start survey →',
      skip: 'Skip and go to sign up',
      languageTitle: 'Choose your language',
      languageSub: 'Wählen Sie Ihre Sprache aus.',
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
      pharmacy: 'Apotheke',
      errands: 'Besorgungen',
      start: 'Umfrage starten →',
      skip: 'Überspringen und direkt zur Anmeldung',
      languageTitle: 'Sprache auswählen',
      languageSub: 'Choose your language.',
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
          ? current.filter(item => item !== option)
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
        background:
          'linear-gradient(150deg, #0d3d1e 0%, #14532d 35%, #166534 70%, #16a34a 100%)',
      }}
    >
      <div className="hidden md:flex md:w-[45%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
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

        <p className="relative z-10 text-white/20 text-xs">© 2026 Bringo · Germany</p>
      </div>

      <div className="flex-1 bg-white min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[520px]">
          <div className="flex justify-end mb-8">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setSurveyLang('de')}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  surveyLang === 'de' ? 'bg-white text-gray-900 shadow' : 'text-gray-400'
                }`}
              >
                🇩🇪 DE
              </button>
              <button
                onClick={() => setSurveyLang('en')}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  surveyLang === 'en' ? 'bg-white text-gray-900 shadow' : 'text-gray-400'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
                  <div className="text-2xl mb-1">💊</div>
                  <p className="text-sm font-semibold text-green-800">{intro.pharmacy}</p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <p className="text-sm font-semibold text-green-800">{intro.errands}</p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-xl font-semibold text-white text-base"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                }}
              >
                {intro.start}
              </button>

              <button onClick={onFinish} className="w-full text-green-700 underline font-medium">
                {intro.skip}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-gray-900">{intro.languageTitle}</h2>
              <p className="text-gray-500 text-lg">{intro.languageSub}</p>

              <button
                onClick={() => { setSurveyLang('de'); setStep(2) }}
                className="w-full flex items-center justify-between border border-gray-200 rounded-2xl p-5 hover:bg-green-50 hover:border-green-200 transition"
              >
                <span className="font-bold text-xl">🇩🇪 Deutsch</span>
                <span>→</span>
              </button>

              <button
                onClick={() => { setSurveyLang('en'); setStep(2) }}
                className="w-full flex items-center justify-between border border-gray-200 rounded-2xl p-5 hover:bg-green-50 hover:border-green-200 transition"
              >
                <span className="font-bold text-xl">🇬🇧 English</span>
                <span>→</span>
              </button>

              <p className="text-sm text-gray-400">🔒 {intro.privacy}</p>
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

              {(['normal', 'large', 'xl'] as TextSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
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

              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${((questionIndex + 1) / surveyQuestions[surveyLang].length) * 100}%` }}
                />
              </div>

              <div className="text-center space-y-3">
                <div className="text-5xl">{q.emoji}</div>
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
                  className="w-full border border-gray-200 rounded-2xl p-4 min-h-40 outline-none focus:border-green-500"
                  placeholder={surveyLang === 'de' ? 'Schreiben Sie hier...' : 'Write your comment here...'}
                />
              ) : (
                <div className="space-y-3">
                  {q.options.map(option => {
                    const selected = isSelected(option)

                    return (
                      <button
                        key={option}
                        onClick={() => selectOption(option)}
                        className={`w-full border p-4 rounded-2xl text-left transition flex items-center gap-3 ${
                          selected
                            ? 'bg-green-50 border-green-500 text-green-900'
                            : 'border-gray-200 hover:bg-green-50 hover:border-green-200'
                        }`}
                      >
                        <span className="text-xl">
                          {q.multi ? (selected ? '☑️' : '☐') : (selected ? '●' : '○')}
                        </span>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => questionIndex === 0 ? setStep(2) : setQuestionIndex(questionIndex - 1)}
                  className="w-1/2 border border-gray-200 py-3 rounded-xl font-semibold"
                >
                  {surveyLang === 'de' ? 'Zurück' : 'Back'}
                </button>

                <button
                  onClick={() => questionIndex === surveyQuestions[surveyLang].length - 1 ? setStep(4) : setQuestionIndex(questionIndex + 1)}
                  className="w-1/2 bg-green-600 text-white py-3 rounded-xl font-semibold"
                >
                  {surveyLang === 'de' ? 'Weiter' : 'Next'}
                </button>
              </div>

              <button onClick={onFinish} className="w-full text-green-700 underline font-medium">
                {surveyLang === 'de' ? 'Überspringen und direkt zur Anmeldung' : 'Skip and go to sign up'}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-7">
              <div className="text-7xl">✅</div>
              <h2 className="text-5xl font-black text-gray-900">
                {surveyLang === 'de' ? 'Vielen Dank!' : 'Thank you!'}
              </h2>
              <p className="text-gray-500 text-xl leading-relaxed">
                {surveyLang === 'de'
                  ? 'Ihr Feedback hilft uns, Bringo zu verbessern und die Bedürfnisse der Nutzer besser zu verstehen.'
                  : 'Your feedback helps us improve Bringo and understand what users need.'}
              </p>
              <button
                onClick={onFinish}
                className="w-full py-4 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                }}
              >
                {surveyLang === 'de' ? 'Weiter zur Anmeldung →' : 'Continue to sign up →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('49')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

function MockOrderCard({ activeLabel }: { activeLabel: string }) {
  return (
    <div
      className="rounded-2xl p-5 border border-white/10"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-300 pulse-dot inline-block" />
        <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">
          {activeLabel}
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center pt-0.5 shrink-0">
          <div className="relative" style={{ width: 12, height: 12 }}>
            <div className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
            <div className="relative w-3 h-3 rounded-full bg-green-400" />
          </div>

          <div className="relative my-1.5" style={{ width: 2, minHeight: 30, flex: 1 }}>
            <div
              className="absolute inset-0"
              style={{ borderLeft: '2px dashed rgba(255,255,255,0.2)' }}
            />
            <div
              className="absolute rounded-full bg-green-400"
              style={{
                width: 8,
                height: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'routeTravel 2.6s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(74,222,128,0.9), 0 0 3px rgba(74,222,128,0.6)',
              }}
            />
          </div>

          <div className="w-3 h-3 rounded-full bg-white/40 shrink-0" />
        </div>

        <div className="flex flex-col justify-between flex-1 py-0.5 gap-2">
          <span className="text-white/80 text-sm leading-tight">
            CAMPUS Pfarrkirchen, Petersbogen 1
          </span>
          <span className="text-white/60 text-sm leading-tight">
            Stadtplatz 12, 84347 Pfarrkirchen
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="text-white/60 text-xs font-semibold">4.9</span>
        </div>
        <span className="text-white/50 text-xs">Jonas M. · 3 min away</span>
        <span className="text-green-300 text-xs font-bold">€3.80</span>
      </div>
    </div>
  )
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/10"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-white/80 text-sm font-medium">{text}</span>
    </div>
  )
}

export default function LoginPage() {
  const { lang } = useLang()
  const [phone, setPhone] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { clearSession() }, [])

  const tr = translations[lang]
  const digits = phone.replace(/\s/g, '')
  const isValid = digits.length >= 9

  const handleContinue = () => {
    if (isValid) navigate('/otp', { state: { phone: `+49 ${phone}`, lang } })
  }

  if (showOnboarding) {
    return <OnboardingFlow onFinish={() => setShowOnboarding(false)} />
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex md:w-[48%] lg:w-[52%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden"
        style={{
          background:
            'linear-gradient(150deg, #0d3d1e 0%, #14532d 30%, #166534 65%, #16a34a 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">bringo</span>
        </div>

        <div className="relative z-10 space-y-7">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              {tr.leftH1a}
              <br />
              {tr.leftH1b}
              <br />
              <span className="text-green-300">{tr.leftH1c}</span>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed">{tr.leftSub}</p>
          </div>

          <MockOrderCard activeLabel={tr.activeDelivery} />

          <div className="space-y-2">
            <FeaturePill
              text={tr.f1}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
            />
            <FeaturePill
              text={tr.f2}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              }
            />
            <FeaturePill
              text={tr.f3}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.970 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.970c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              }
            />
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">{tr.footer}</p>
      </div>

      <div className="flex-1 flex flex-col bg-white min-h-screen relative">
        <div className="flex items-center justify-between px-6 pt-6 md:px-8 md:pt-7">
          <div className="md:hidden flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">bringo</span>
          </div>
          <div className="hidden md:block" />
          <LangToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 lg:px-16 py-10">
          <div className="w-full max-w-[400px]">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">
                {tr.badge}
              </span>
            </div>

            <h1 className="font-black mb-5">
              <span className="block text-6xl lg:text-[72px] text-gray-900 leading-none">
                {tr.h1}
              </span>
              <span className="block text-6xl lg:text-[72px] gradient-text leading-none pb-2">
                {tr.h2}
              </span>
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed mb-10">{tr.subtitle}</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {tr.phoneLabel}
              </label>
              <div
                className="flex items-stretch rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: '2px solid',
                  borderColor: phone.length > 0 ? '#16a34a' : '#e5e7eb',
                  boxShadow:
                    phone.length > 0 ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 px-4 py-4 bg-gray-50 border-r-2 border-gray-200 shrink-0">
                  <span className="text-lg">🇩🇪</span>
                  <span className="text-sm font-bold text-gray-600">+49</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  placeholder="151 234 56789"
                  className="flex-1 px-4 py-4 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white"
                  autoComplete="tel"
                />
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200 mb-5"
              style={{
                background: isValid
                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  : '#f3f4f6',
                color: isValid ? 'white' : '#9ca3af',
                boxShadow: isValid ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
              }}
            >
              {tr.continue}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <p className="text-center text-xs text-gray-400 leading-relaxed">
              {lang === 'de' ? (
                <>
                  Mit dem Fortfahren stimmen Sie unseren{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Nutzungsbedingungen
                  </a>{' '}
                  und{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Datenschutzrichtlinien
                  </a>{' '}
                  zu.
                </>
              ) : (
                <>
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Privacy Policy
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}