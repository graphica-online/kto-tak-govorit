import { useRef, useCallback, useEffect } from 'react'

interface Options {
  src: string | null
  volume?: number
  muted?: boolean
  onPlay?: () => void
  onEnd?: () => void
  onError?: () => void
}

export function useAnimalSound({ src, volume = 0.8, muted = false, onPlay, onEnd, onError }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Уничтожаем старый
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    if (!src) return

    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.volume = muted ? 0 : volume

    audio.addEventListener('play', () => onPlay?.())
    audio.addEventListener('ended', () => onEnd?.())
    audio.addEventListener('error', () => onError?.())

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    const promise = audio.play()

    // Обработка ошибки autoplay (браузер может заблокировать)
    if (promise !== undefined) {
      promise.catch(() => {
        // Повторная попытка через короткую задержку
        setTimeout(() => {
          audio.play().catch(() => onError?.())
        }, 50)
      })
    }
  }, [onError])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return { play, stop }
}