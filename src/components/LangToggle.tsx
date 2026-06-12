import { useLang, type Lang } from '../hooks/useLang'

export default function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-1 shrink-0" role="group" aria-label="Language">
      {(['de', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === 'de' ? 'Auf Deutsch wechseln' : 'Switch to English'}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background: lang === l ? 'white' : 'transparent',
            color: lang === l ? '#111827' : '#9ca3af',
            boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span aria-hidden="true">{l === 'de' ? '🇩🇪' : '🇬🇧'}</span>
          <span className="uppercase">{l}</span>
        </button>
      ))}
    </div>
  )
}
