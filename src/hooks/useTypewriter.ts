import { useEffect, useState } from 'react'

export function useTypewriter(text: string, speed = 38, startDelay = 600, reducedMotion = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    if (reducedMotion) return
    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount(value => {
          if (value >= text.length - 1) clearInterval(interval)
          return Math.min(value + 1, text.length)
        })
      }, speed)
    }, startDelay)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [text, speed, startDelay, reducedMotion])
  return { displayed: reducedMotion ? text : text.slice(0, count), done: reducedMotion || count >= text.length }
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}
