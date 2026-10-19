import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'

export interface PlayButtonHandle {
  play: () => void
}

interface Props {
  soundUrls: string[]
  silent?: boolean
  muted?: boolean
  volume?: number
  onPlayStateChange?: (playing: boolean) => void
    playAllVariants?: boolean
}

const PlayButton = forwardRef<PlayButtonHandle, Props>(
    ({ soundUrls, silent = false, muted = false, volume = 0.8, onPlayStateChange, playAllVariants = false }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasError, setHasError] = useState(false)
      // Сброс ошибки при смене звуков (фикс бага с первым животным)
  const prevUrlsRef = useRef(soundUrls)
  if (prevUrlsRef.current !== soundUrls) {
    prevUrlsRef.current = soundUrls
    setHasError(false)
  }
    const [duration, setDuration] = useState(3)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const lastIndexRef = useRef<number>(-1)
    const [queueIndex, setQueueIndex] = useState(0)
    const queueRef = useRef(false)

    const isDisabled = silent || soundUrls.length === 0

    /* Выбор случайного звука (не повторяя предыдущий) */
    const pickRandomSound = (): string => {
      if (soundUrls.length === 1) return soundUrls[0]
      let idx: number
      do {
        idx = Math.floor(Math.random() * soundUrls.length)
      } while (idx === lastIndexRef.current && soundUrls.length > 1)
      lastIndexRef.current = idx
      return soundUrls[idx]
    }

    const stopAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      setIsPlaying(false)
      onPlayStateChange?.(false)
    }

      const playSingle = (url: string) => {
    const audio = new Audio(url)
    audio.volume = muted ? 0 : volume
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    })

    audio.addEventListener('ended', () => {
      // Если режим «все варианты» — играем следующий
      if (queueRef.current && queueIndex < soundUrls.length - 1) {
        setQueueIndex(q => q + 1)
        playSingle(soundUrls[queueIndex + 1])
      } else {
        queueRef.current = false
        setQueueIndex(0)
        setIsPlaying(false)
        onPlayStateChange?.(false)
      }
    })

    audio.addEventListener('error', () => {
      setHasError(true)
      setIsPlaying(false)
      queueRef.current = false
      onPlayStateChange?.(false)
    })

    const promise = audio.play()
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true)
          setHasError(false)
          onPlayStateChange?.(true)
        })
        .catch(() => {
          setTimeout(() => {
            audio.play()
              .then(() => { setIsPlaying(true); setHasError(false); onPlayStateChange?.(true) })
              .catch(() => { setHasError(true); onPlayStateChange?.(false) })
          }, 50)
        })
    }
  }

  const startPlay = () => {
    if (isDisabled) return

    if (isPlaying) {
      stopAudio()
      return
    }

    if (playAllVariants && soundUrls.length > 1) {
      queueRef.current = true
      setQueueIndex(0)
      playSingle(soundUrls[0])
    } else {
      const url = pickRandomSound()
      playSingle(url)
    }
  }

    useImperativeHandle(ref, () => ({ play: startPlay }))

    const getLabel = () => {
      if (silent) return 'Нет звука'
      if (soundUrls.length === 0) return 'Нет файла'
      if (hasError) return 'Звук не найден'
      if (isPlaying) return 'Воспроизводится...'
      if (soundUrls.length > 1) return `Послушать (${soundUrls.length} вариации)`
      return 'Послушать голос'
    }

    const getIcon = () => {
      if (silent || soundUrls.length === 0) return '🔇'
      if (hasError) return '⚠️'
      if (isPlaying) return '⏸'
      return '▶'
    }

    return (
      <motion.button
        onClick={startPlay}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        style={{
          position: 'relative',
          width: '100%', height: 60, borderRadius: 20,
          background: isDisabled ? 'var(--c-bg-mute)' : 'var(--c-brand)',
          color: isDisabled ? 'var(--c-text-dim)' : '#fff',
          border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: 17, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: isDisabled ? 'none' : 'var(--shadow-brand)',
          overflow: 'hidden',
        }}
      >
        {isPlaying && (
          <>
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '2px solid rgba(255,255,255,.4)' }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '2px solid rgba(255,255,255,.3)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
          </>
        )}

        <motion.span
          style={{ fontSize: 22, position: 'relative', zIndex: 1 }}
          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {getIcon()}
        </motion.span>

        <span style={{ position: 'relative', zIndex: 1 }}>{getLabel()}</span>

        {isPlaying && (
          <motion.div
            key={`bar-${Date.now()}`}
            style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: 'rgba(255,255,255,.6)', borderRadius: 2 }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration, ease: 'linear' }}
          />
        )}
      </motion.button>
    )
  }
)

PlayButton.displayName = 'PlayButton'
export default PlayButton