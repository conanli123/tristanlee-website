import { useEffect, useRef, useState } from 'react'

export function useVideoScrub(reducedMotion: boolean, suspended: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0.45)
  const seekTo = useRef<(progress: number) => void>(() => {})

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let targetTime = 0
    let previousX: number | null = null
    let pending = false
    let lastProgressUpdate = 0

    const duration = () => Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.05) : 0
    const seek = () => {
      if (pending || video.seeking || !duration() || Math.abs(video.currentTime - targetTime) < 0.015) return
      pending = true
      video.currentTime = targetTime
    }
    const initialize = () => {
      targetTime = duration() * 0.45
      setProgress(0.45)
      seek()
    }
    const handleSeeked = () => { pending = false; seek() }
    const handleReady = () => { setReady(true); setFailed(false) }
    const handleError = () => { setFailed(true); setReady(false) }
    const pointerMove = (event: MouseEvent) => {
      if (reducedMotion || suspended || window.scrollY > window.innerHeight * 0.6) { previousX = null; return }
      if (previousX === null) { previousX = event.clientX; return }
      const delta = event.clientX - previousX
      previousX = event.clientX
      targetTime = Math.max(0, Math.min(duration(), targetTime + (delta / window.innerWidth) * 0.8 * duration()))
      seek()
      if (performance.now() - lastProgressUpdate > 90) {
        setProgress(duration() ? targetTime / duration() : 0.45)
        lastProgressUpdate = performance.now()
      }
    }
    const resetPointer = () => { previousX = null }
    seekTo.current = (value) => {
      targetTime = duration() * Math.max(0, Math.min(1, value))
      setProgress(value)
      seek()
    }
    video.addEventListener('loadedmetadata', initialize)
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)
    window.addEventListener('mousemove', pointerMove, { passive: true })
    document.addEventListener('mouseleave', resetPointer)
    if (video.readyState >= 1) initialize()
    if (video.readyState >= 2) handleReady()
    return () => {
      video.removeEventListener('loadedmetadata', initialize)
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
      window.removeEventListener('mousemove', pointerMove)
      document.removeEventListener('mouseleave', resetPointer)
    }
  }, [reducedMotion, suspended])
  return { videoRef, ready, failed, progress, seekTo }
}
