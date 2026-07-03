export type TextSize = 'normal' | 'large' | 'xl'

const KEY = 'bringo-text-size'
const SIZE_MAP: Record<TextSize, string> = { normal: '100%', large: '115%', xl: '130%' }

export function getTextSize(): TextSize {
  return (localStorage.getItem(KEY) as TextSize) ?? 'normal'
}

export function applyTextSize(size: TextSize) {
  document.documentElement.style.fontSize = SIZE_MAP[size]
  localStorage.setItem(KEY, size)
}
