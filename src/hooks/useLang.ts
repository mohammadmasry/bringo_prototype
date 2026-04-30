import { useState } from 'react'

export type Lang = 'de' | 'en'

const KEY = 'bringo-lang'

export function useLang() {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(KEY) as Lang) ?? 'de'
  )

  const setLang = (l: Lang) => {
    localStorage.setItem(KEY, l)
    setLangState(l)
  }

  return { lang, setLang }
}
