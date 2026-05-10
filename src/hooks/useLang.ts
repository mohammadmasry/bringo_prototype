import { createContext, useContext, useState, createElement, type ReactNode } from 'react'

export type Lang = 'de' | 'en'

const KEY = 'bringo-lang'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const Ctx = createContext<LangCtx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(KEY) as Lang) ?? 'de'
  )
  const setLang = (l: Lang) => {
    localStorage.setItem(KEY, l)
    setLangState(l)
  }
  return createElement(Ctx.Provider, { value: { lang, setLang } }, children)
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be within LangProvider')
  return ctx
}
