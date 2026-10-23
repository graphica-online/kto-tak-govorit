import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayButton, { type PlayButtonHandle } from './PlayButton'
import type { Animal } from '../data/types'
import type { TransitionType } from '../store/useSettings'

export interface AnimalStageHandle {
  playSound: () => void
}

interface Props {
  animal: Animal
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  muted?: boolean
  volume?: number
  transitionType?: TransitionType
  onPlayStateChange?: (playing: boolean) => void
  playAllVariants?: boolean
}

const categoryHues: Record<string, number> = {
  pets: 30, farm: 90, africa: 35, forest: 140,
  birds: 200, sea: 195, insects: 60,
}

const emojiMap: Record<string, string> = {
  cat: '🐱', dog: '🐶', cow: '🐄', chicken: '🐔',
  lion: '🦁', elephant: '🐘', bear: '🐻', wolf: '🐺',
  dolphin: '🐬', owl: '🦉',
}

// Варианты анимации
const variants = {
  smooth: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  },
  simple: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
}

const AnimalStage = forwardRef<AnimalStageHandle, Props>(
      ({ animal, index, total, onPrev, onNext, muted = false, volume = 0.8, transitionType = 'smooth', onPlayStateChange, playAllVariants = false }, ref) => {
    const hue = categoryHues[animal.categories[0]] ?? 200
    const emoji = emojiMap[animal.id] ?? '🐾'
    const [imgLoaded, setImgLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
        useEffect(() => {
      setImgLoaded(false)
      setImgError(false)
    }, [animal.id])
        // Сброс при смене животного
    useEffect(() => {
      setImgLoaded(false)
      setImgError(false)
    }, [animal.id])
    const playBtnRef = useRef<PlayButtonHandle>(null)

    const hasPhoto = !!animal.photo && !imgError
    const v = variants[transitionType]
    const dur = transitionType === 'none' ? 0 : 0.35

    useImperativeHandle(ref, () => ({
      playSound: () => playBtnRef.current?.play(),
    }))

    return (
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, hsl(${hue}, 100%, 92%), hsl(${hue + 30}, 100%, 96%))`,
      }}>

        {/* Фото или эмодзи */}
        <AnimatePresence mode="wait">
          <motion.div
            key={animal.id}
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ duration: dur, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {hasPhoto ? (
              <img
                src={animal.photo}
                alt={animal.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity .5s ease',
                }}
              />
            ) : (
              <div style={{
                fontSize: 'min(35vw, 300px)',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.15))',
                userSelect: 'none',
              }}>
                {emoji}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Glass Panel Wrapper */}
        <div style={{
          position: 'absolute',
          right: 32, top: '50%',
          transform: 'translateY(-50%)',
          width: 360,
          display: 'flex', flexDirection: 'column', gap: 12,
          zIndex: 10,
        }}>

          {/* Info Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`panel-${animal.id}`}
              initial={v.initial}
              animate={v.animate}
              exit={v.exit}
              transition={{ duration: dur, ease: [0.4, 0, 0.2, 1] }}
              className="glass"
              style={{
                padding: 28, borderRadius: 28,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}
            >
              <span style={{
                display: 'inline-flex', padding: '5px 12px', borderRadius: 999,
                fontSize: 12, fontWeight: 600, width: 'fit-content',
                background: 'var(--c-brand-soft)', color: 'var(--c-brand)',
              }}>
                {animal.animalClass}
              </span>

              <h2 style={{
                fontSize: 42, fontWeight: 800, letterSpacing: '-.03em',
                lineHeight: 1, color: 'var(--c-text-strong)',
              }}>
                {animal.name}
              </h2>

              <p style={{ fontSize: 15, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                {animal.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Среда', value: animal.habitat },
                  { label: 'Звук', value: animal.silent ? '🔇 Нет' : `🔊 ${animal.sounds.length}` },
                  { label: 'Позиция', value: `${index + 1} / ${total}` },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, padding: '5px 0',
                    borderBottom: '1px solid var(--c-border)',
                  }}>
                    <span style={{ color: 'var(--c-text-dim)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--c-text-strong)', fontVariantNumeric: 'tabular-nums' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

                <PlayButton
                ref={playBtnRef}
                soundUrls={animal.sounds}
                silent={animal.silent}
                muted={muted}
                volume={volume}
                onPlayStateChange={onPlayStateChange}
                playAllVariants={playAllVariants}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="glass"
            style={{
              padding: 10, borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <motion.button
              onClick={onPrev}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,.5)',
                border: '1px solid rgba(255,255,255,.4)',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--c-text-strong)',
              }}
            >
              <span style={{ fontSize: 22 }}>‹</span> Назад
            </motion.button>
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,.5)',
                border: '1px solid rgba(255,255,255,.4)',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--c-text-strong)',
              }}
            >
              Вперёд <span style={{ fontSize: 22 }}>›</span>
            </motion.button>
          </motion.div>

          {/* Progress */}
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
            <motion.div
              key={`progress-${index}`}
              initial={{ width: 0 }}
              animate={{ width: `${((index + 1) / total) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--c-brand)' }}
            />
          </div>
        </div>
      </div>
    )
  }
)

AnimalStage.displayName = 'AnimalStage'
export default AnimalStage