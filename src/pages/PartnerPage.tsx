import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { api } from '../lib/api'

const TYPES = {
  de: ['Restaurant', 'Supermarkt / Lebensmittel', 'Café / Bäckerei', 'Apotheke', 'Andere'],
  en: ['Restaurant', 'Supermarket / Grocery', 'Café / Bakery', 'Pharmacy', 'Other'],
}

const tr = {
  de: {
    badge: 'Geschäftspartner',
    title: 'Partnerschaft beantragen',
    sub: 'Werden Sie Teil des Bringo-Netzwerks. Wir prüfen Ihre Anfrage und melden uns innerhalb von 48 Stunden.',
    companyName: 'Unternehmensname', companyNamePh: 'z.B. Bäckerei Müller',
    companyType: 'Art des Unternehmens',
    address: 'Adresse', addressPh: 'Straße, Hausnummer, PLZ, Stadt',
    contactPerson: 'Ansprechpartner', contactPersonPh: 'Vor- und Nachname',
    email: 'E-Mail', emailPh: 'kontakt@unternehmen.de',
    phone: 'Telefon', phonePh: '+49 151 …',
    description: 'Kurzbeschreibung (optional)', descriptionPh: 'Was bieten Sie an? Was erhoffen Sie sich von der Partnerschaft?',
    submit: 'Bewerbung absenden',
    submitting: 'Wird gesendet…',
    successTitle: 'Bewerbung eingegangen! 🎉',
    successSub: 'Vielen Dank für Ihr Interesse. Wir prüfen Ihre Anfrage und melden uns innerhalb von 48 Stunden per E-Mail bei Ihnen.',
    backHome: 'Zur Startseite',
    required: 'Pflichtfeld',
    termsNote: 'Mit dem Absenden stimmen Sie unseren Nutzungsbedingungen und Partnerschaftsrichtlinien zu.',
  },
  en: {
    badge: 'Business partner',
    title: 'Apply for partnership',
    sub: 'Join the Bringo network. We review your application and get back to you within 48 hours.',
    companyName: 'Company name', companyNamePh: 'e.g. Müller Bakery',
    companyType: 'Type of business',
    address: 'Address', addressPh: 'Street, number, zip code, city',
    contactPerson: 'Contact person', contactPersonPh: 'First and last name',
    email: 'Email', emailPh: 'contact@company.com',
    phone: 'Phone', phonePh: '+49 151 …',
    description: 'Short description (optional)', descriptionPh: 'What do you offer? What do you hope to get from the partnership?',
    submit: 'Submit application',
    submitting: 'Submitting…',
    successTitle: 'Application received! 🎉',
    successSub: 'Thank you for your interest. We will review your application and contact you within 48 hours by email.',
    backHome: 'Back to home',
    required: 'Required',
    termsNote: 'By submitting you agree to our terms of service and partnership guidelines.',
  },
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function PartnerPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = tr[lang]
  const types = TYPES[lang]

  const [companyName, setCompanyName] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isValid =
    companyName.trim().length >= 2 &&
    companyType.length > 0 &&
    address.trim().length >= 5 &&
    contactPerson.trim().length >= 2 &&
    email.includes('@') &&
    phone.trim().length >= 5

  const inputClass = "w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors"

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setError('')
    setLoading(true)
    try {
      await api.partners.apply({ companyName, companyType, address, contactPerson, email, phone, description })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-6">🤝</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">{t.successTitle}</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">{t.successSub}</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
        >
          {t.backHome}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-gray-100">
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">bringo</span>
        </div>
        <LangToggle />
      </div>

      <div className="flex-1 px-6 max-w-lg mx-auto w-full pb-12 pt-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-6">
          <span className="text-sm">🏪</span>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t.badge}</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.sub}</p>

        <div className="space-y-4">
          <Field label={t.companyName} required>
            <input type="text" value={companyName} autoFocus onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t.companyNamePh}
              className={inputClass}
              style={{ borderColor: companyName.length > 0 ? '#16a34a' : '#e5e7eb' }} />
          </Field>

          <Field label={t.companyType} required>
            <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}
              className={inputClass}
              style={{ borderColor: companyType.length > 0 ? '#16a34a' : '#e5e7eb', color: companyType ? '#111827' : '#9ca3af' }}>
              <option value="" disabled>{lang === 'de' ? 'Bitte wählen' : 'Please select'}</option>
              {types.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </Field>

          <Field label={t.address} required>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPh}
              className={inputClass}
              style={{ borderColor: address.length > 0 ? '#16a34a' : '#e5e7eb' }} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t.contactPerson} required>
              <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                placeholder={t.contactPersonPh}
                className={inputClass}
                style={{ borderColor: contactPerson.length > 0 ? '#16a34a' : '#e5e7eb' }} />
            </Field>
            <Field label={t.phone} required>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className={inputClass}
                style={{ borderColor: phone.length > 0 ? '#16a34a' : '#e5e7eb' }} />
            </Field>
          </div>

          <Field label={t.email} required>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPh}
              className={inputClass}
              style={{ borderColor: email.includes('@') ? '#16a34a' : email.length > 0 ? '#f87171' : '#e5e7eb' }} />
          </Field>

          <Field label={t.description}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPh} rows={3}
              className={`${inputClass} resize-none`}
              style={{ borderColor: description.length > 0 ? '#16a34a' : '#e5e7eb' }} />
          </Field>
        </div>

        <div className="mt-8">
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <button onClick={handleSubmit} disabled={!isValid || loading}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 group transition-all duration-200 mb-4"
            style={{
              background: isValid && !loading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              color: isValid && !loading ? 'white' : '#9ca3af',
              boxShadow: isValid && !loading ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
            }}>
            {loading ? t.submitting : t.submit}
            {!loading && (
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">{t.termsNote}</p>
        </div>
      </div>
    </div>
  )
}
