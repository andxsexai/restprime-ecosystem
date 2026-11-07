import { useEffect, useRef, useState } from 'react'

export default function RouletteText({ children, className = '' }) {
  const box = useRef(null)
  const line = useRef(null)
  const [shift, setShift] = useState(0)

  useEffect(() => {
    const wrap = box.current
    const text = line.current
    if (!wrap || !text) return undefined
    const measure = () => {
      const extra = Math.round(text.scrollWidth - wrap.clientWidth)
      setShift(extra > 10 ? extra : 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [children])

  return (
    <span ref={box} className={`roulette ${shift ? 'roulette-live' : ''} ${className}`}>
      <span ref={line} style={{ '--roulette-shift': `-${shift}px` }}>{children}</span>
    </span>
  )
}
