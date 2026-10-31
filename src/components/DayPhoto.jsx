import { useState } from 'react'
import { photoForDay } from '../data/photos.js'

export default function DayPhoto({ day, className = '' }) {
  const photo = photoForDay(day)
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <figure className="overflow-hidden">
      <img src={photo.src} alt={photo.alt} className={className} onError={() => setHidden(true)} />
      <figcaption className="px-1 pt-2 text-[11px] tracking-wide text-ink/50">Пример кадра с Pexels, не съёмка KEDR</figcaption>
    </figure>
  )
}
