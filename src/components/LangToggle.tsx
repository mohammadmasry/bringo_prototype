import { useLang, type Lang } from '../hooks/useLang'

export default function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-1 shrink-0">
      {(['de', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background: lang === l ? 'white' : 'transparent',
            color: lang === l ? '#111827' : '#9ca3af',
            boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span>{l === 'de' ? '🇩🇪' : '🇬🇧'}</span>
          <span className="uppercase">{l}</span>
        </button>
      ))}
    </div>
  )
}
