import { useState } from 'react'
import { getTextSize, applyTextSize, type TextSize } from '../lib/textSize'

const SIZES: TextSize[] = ['normal', 'large', 'xl']

export default function TextSizeToggle() {
  const [size, setSize] = useState<TextSize>(getTextSize)

  const cycle = () => {
    const next = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length]
    setSize(next)
    applyTextSize(next)
  }

  return (
    <button
      onClick={cycle}
      title="Textgröße ändern / Change text size"
      className="fixed bottom-6 right-16 z-[9999] flex items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all"
      style={{
        background: size === 'normal' ? 'rgba(255,255,255,0.92)' : '#f0fdf4',
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${size === 'normal' ? 'rgba(0,0,0,0.10)' : '#bbf7d0'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        color: size === 'normal' ? '#6b7280' : '#15803d',
      }}
    >
      <span style={{ fontSize: size === 'normal' ? '15px' : size === 'large' ? '18px' : '21px', fontWeight: 800, lineHeight: 1 }}>
        Aa
      </span>
      <span style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1, opacity: 0.7 }}>
        {size === 'normal' ? 'Normal' : size === 'large' ? 'Groß' : 'XL'}
      </span>
    </button>
  )
}
