import { useEffect } from 'react'

interface KeyboardActions {
  onNext?: () => void
  onPrev?: () => void
  onPlay?: () => void
  onMute?: () => void
  onSettings?: () => void
  onFullscreen?: () => void
  onFirst?: () => void
  onLast?: () => void
  onCheatsheet?: () => void
  onCategory?: (index: number) => void
  onEscape?: () => void
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e.key
      const code = e.code

      switch (true) {
        // Навигация вперёд: → ↓ D(en) В(ru)
        case key === 'ArrowRight' || key === 'ArrowDown' ||
             code === 'KeyD':
          e.preventDefault()
          actions.onNext?.()
          break

        // Навигация назад: ← ↑ A(en) Ф(ru)
        case key === 'ArrowLeft' || key === 'ArrowUp' ||
             code === 'KeyA':
          e.preventDefault()
          actions.onPrev?.()
          break

        // Воспроизведение
        case key === ' ' || key === 'Enter':
          e.preventDefault()
          actions.onPlay?.()
          break

        // Mute: M(en) Ь(ru)
        case code === 'KeyM':
          e.preventDefault()
          actions.onMute?.()
          break

        // Настройки: S(en) Ы(ru)
        case code === 'KeyS':
          e.preventDefault()
          actions.onSettings?.()
          break

        // Полноэкранный: F(en) А(ru)
        case code === 'KeyF':
          e.preventDefault()
          actions.onFullscreen?.()
          break

        // Шпаргалка: H(en) Р(ru) или ?
        case code === 'KeyH' || key === '?':
          e.preventDefault()
          actions.onCheatsheet?.()
          break

        case key === 'Home':
          e.preventDefault()
          actions.onFirst?.()
          break

        case key === 'End':
          e.preventDefault()
          actions.onLast?.()
          break

        case key === 'Escape':
          e.preventDefault()
          actions.onEscape?.()
          break

        // Цифры 1-9 — выбор категории
        case key >= '1' && key <= '9':
          e.preventDefault()
          actions.onCategory?.(parseInt(key) - 1)
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions])
}