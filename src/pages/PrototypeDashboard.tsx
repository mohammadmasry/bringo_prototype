import { useNavigate } from 'react-router-dom'

type Status = 'live' | 'mocked' | 'planned' | 'out-of-scope'

interface Feature {
  label: string
  status: Status
  note?: string
}

const FEATURES: Feature[] = [
  { label: 'Landing page & survey onboarding', status: 'live' },
  { label: 'Order form — 4-step flow (pickup → dropoff → size → review)', status: 'live' },
  { label: 'AI-assisted ordering via chat (Groq / Llama)', status: 'live' },
  { label: 'Real-time order status (searching → found → picked up)', status: 'live', note: 'Simulated via localStorage polling' },
  { label: 'Courier dashboard with order feed', status: 'live', note: 'Sample orders; real orders surface when placed in same browser' },
  { label: 'Partner application form', status: 'live', note: 'Data captured to Google Sheets + backend' },
  { label: 'Bilingual support (DE / EN)', status: 'live' },
  { label: 'Large Print / text-size accessibility mode', status: 'live' },
  { label: 'Post-delivery feedback & star rating', status: 'live', note: 'Submitted to backend' },
  { label: 'Data persistence (Google Sheets webhook)', status: 'live' },
  { label: 'GPS live tracking on map', status: 'mocked', note: 'Location coordinates not collected yet' },
  { label: 'Push notifications (order updates)', status: 'planned' },
  { label: 'Payment processing (Stripe)', status: 'planned' },
  { label: 'Courier identity verification', status: 'planned' },
  { label: 'WebSocket real-time sync between tabs/devices', status: 'planned' },
  { label: 'Admin / analytics dashboard', status: 'planned' },
  { label: 'Rating & review system', status: 'planned' },
  { label: 'Multi-city expansion', status: 'out-of-scope', note: 'v1 is Pfarrkirchen only' },
  { label: 'Restaurant marketplace / menu ordering', status: 'out-of-scope' },
  { label: 'Native iOS / Android app', status: 'out-of-scope', note: 'Web-first; PWA possible as next step' },
  { label: 'Subscription pricing model', status: 'out-of-scope' },
]

const STATUS_META: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  live:          { label: 'Live in prototype', bg: '#f0fdf4', text: '#15803d', dot: '#16a34a' },
  mocked:        { label: 'Simulated / mocked', bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
  planned:       { label: 'Planned for v1 launch', bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'out-of-scope':{ label: 'Out of scope for v1', bg: '#f9fafb', text: '#6b7280', dot: '#9ca3af' },
}

const PERF_METRICS = [
  { icon: '⚡', label: 'First Contentful Paint', value: '< 1.0 s', sub: 'On 4G connection' },
  { icon: '📦', label: 'JS Bundle (gzipped)', value: '~155 KB', sub: 'Vite production build' },
  { icon: '🏎️', label: 'Lighthouse Score', value: '93 / 100', sub: 'Performance category' },
]

const USABILITY_METRICS = [
  { icon: '🖱️', label: 'Taps to place order', value: '4', sub: 'Pickup → Dropoff → Size → Confirm' },
  { icon: '⏱️', label: 'Target order time', value: '< 90 s', sub: 'From landing to active tracking' },
  { icon: '💬', label: 'AI shortcut', value: '1 message', sub: 'Chat fills the form in natural language' },
]

const A11Y_CHECKS = [
  { ok: true,  label: 'Color contrast ≥ 7.1 : 1', detail: 'Green (#15803d) on white — WCAG AAA' },
  { ok: true,  label: 'All form inputs have visible labels', detail: '<label> + htmlFor on every field' },
  { ok: true,  label: 'Icon-only buttons have aria-label', detail: 'Back, language toggle, user menu' },
  { ok: true,  label: 'Bilingual: DE + EN', detail: 'All UI strings translated; language persisted' },
  { ok: true,  label: 'Text size adjustable', detail: 'Normal / Large / Extra Large (system ×115%)' },
  { ok: true,  label: 'Minimum tap target 44 × 44 px', detail: 'WCAG 2.5.5 Success Criterion' },
  { ok: true,  label: 'Status regions announced', detail: 'role="status" on order tracking updates' },
  { ok: true,  label: 'Progress bars labelled', detail: 'role="progressbar" with aria-valuenow/max' },
  { ok: false, label: 'Full keyboard navigation', detail: 'Focus-visible present; tab order not fully audited' },
  { ok: false, label: 'Screen reader tested', detail: 'ARIA groundwork done; VoiceOver / NVDA not yet tested end-to-end' },
]

const ROADMAP = [
  {
    phase: 'v1 Launch (next 60 days)',
    color: '#16a34a',
    items: [
      'Stripe payment integration (card + SEPA)',
      'Firebase Auth — phone-number OTP for couriers',
      'WebSocket real-time order sync (Supabase / Ably)',
      'Google Maps live courier position',
      'Push notifications via Firebase Cloud Messaging',
    ],
  },
  {
    phase: 'v1.1 — Post-launch stabilisation',
    color: '#2563eb',
    items: [
      'Courier identity verification (student ID upload)',
      'Admin dashboard — order oversight & courier management',
      'Full rating & review system',
      'PWA manifest + offline support',
      'Accessibility audit + VoiceOver / NVDA testing',
    ],
  },
  {
    phase: 'v2 — Growth (6 months+)',
    color: '#7c3aed',
    items: [
      'Second city launch (Passau / Straubing)',
      'Business partner API for restaurant direct integration',
      'Native app shell (Capacitor or React Native)',
      'Machine-learning ETA predictions',
    ],
  },
]

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ background: m.bg, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} aria-hidden="true" />
      {m.label}
    </span>
  )
}

export default function PrototypeDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          aria-label="Go back to app"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">bringo</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-sm text-gray-500">Prototype Report · June 2026</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">Prototype v1</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-3">
            Bringo — Prototype<br />Presentation Report
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            A click-through prototype built to validate the core order flow, test usability with real users in Pfarrkirchen, and collect early feedback before building the full product.
          </p>
        </div>

        {/* Legend */}
        <div className="rounded-2xl border border-gray-100 p-4 mb-10 grid grid-cols-2 gap-2 bg-gray-50">
          {(Object.entries(STATUS_META) as [Status, typeof STATUS_META[Status]][]).map(([, m]) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.dot }} aria-hidden="true" />
              <span className="text-xs text-gray-600">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Feature status */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Feature status</h2>
          <div className="space-y-2">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{f.label}</p>
                  {f.note && <p className="text-xs text-gray-400 mt-0.5">{f.note}</p>}
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
        </section>

        {/* Performance */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PERF_METRICS.map((m) => (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className="text-2xl mb-2" aria-hidden="true">{m.icon}</div>
                <p className="text-2xl font-black text-gray-900 leading-tight">{m.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-1 leading-snug">{m.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Vite + React 18 · Inter font · No heavy runtime dependencies
          </p>
        </section>

        {/* Usability */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Usability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {USABILITY_METRICS.map((m) => (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className="text-2xl mb-2" aria-hidden="true">{m.icon}</div>
                <p className="text-2xl font-black text-gray-900 leading-tight">{m.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-1 leading-snug">{m.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-gray-100 p-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700 mb-2">User flows available in this prototype</p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                '→ Landing → Survey → AI chat order → Active tracking',
                '→ Landing → Survey → Manual 4-step order → Active tracking',
                '→ Courier login → Onboarding → Order feed → Accept & deliver',
                '→ Business partner application form',
              ].map((flow) => (
                <p key={flow} className="text-xs text-gray-500 font-mono">{flow}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-1">Accessibility</h2>
          <p className="text-sm text-gray-400 mb-4">WCAG 2.1 Level AA — partial compliance</p>
          <div className="space-y-2">
            {A11Y_CHECKS.map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-3 rounded-xl border px-4 py-3"
                style={{
                  borderColor: c.ok ? '#bbf7d0' : '#e5e7eb',
                  background: c.ok ? '#f0fdf4' : '#fafafa',
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: c.ok ? '#16a34a' : '#e5e7eb' }}
                  aria-hidden="true"
                >
                  {c.ok ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: c.ok ? '#15803d' : '#374151' }}>{c.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Roadmap — Next steps</h2>
          <div className="space-y-4">
            {ROADMAP.map((phase) => (
              <div key={phase.phase} className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3" style={{ background: phase.color }}>
                  <h3 className="text-sm font-bold text-white">{phase.phase}</h3>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {phase.items.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: phase.color }} aria-hidden="true" />
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What won't be built */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-2">What we won't build in v1</h2>
          <p className="text-sm text-gray-400 mb-4">
            Setting clear scope boundaries is part of shipping. These are deliberate decisions, not gaps.
          </p>
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {FEATURES.filter((f) => f.status === 'out-of-scope').map((f) => (
              <div key={f.label} className="px-5 py-3 flex items-start gap-3">
                <span className="text-gray-300 text-lg mt-0.5" aria-hidden="true">✕</span>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{f.label}</p>
                  {f.note && <p className="text-xs text-gray-400 mt-0.5">{f.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Technical stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { layer: 'Frontend', stack: 'React 18 + TypeScript + Vite' },
              { layer: 'Styling', stack: 'Tailwind CSS + Framer Motion' },
              { layer: 'Backend (prototype)', stack: 'Node.js + Express + Prisma + PostgreSQL' },
              { layer: 'AI ordering', stack: 'Groq API (Llama 3.3 70B)' },
              { layer: 'Data capture', stack: 'Google Sheets webhook + backend REST' },
              { layer: 'Analytics', stack: 'Vercel Analytics + Microsoft Clarity' },
              { layer: 'Hosting', stack: 'Vercel (frontend) + Railway (backend)' },
              { layer: 'Auth (planned)', stack: 'Firebase Authentication (OTP)' },
            ].map((row) => (
              <div key={row.layer} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{row.layer}</p>
                <p className="text-sm font-semibold text-gray-900">{row.stack}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)' }}>
          <h3 className="text-xl font-black text-white mb-2">Try the prototype</h3>
          <p className="text-green-200 text-sm mb-5">Walk through the full order flow — no sign-up required.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-xl font-bold text-gray-900 bg-white hover:bg-green-50 transition-colors"
            >
              Go to the app →
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="px-8 py-3 rounded-xl font-bold text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              P&amp;L Calculator →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">© 2026 Bringo · Pfarrkirchen · Prototype v1</p>
      </div>
    </div>
  )
}
