import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import CategoryBar from '../components/CategoryBar'
import AnimalStage, { type AnimalStageHandle } from '../components/AnimalStage'
import { useKeyboard } from '../hooks/useKeyboard'
import { useSwipe } from '../hooks/useSwipe'
import { useSettings } from '../store/useSettings'
import animalsData from '../data/animals.json'
import categoriesData from '../data/categories.json'
import type { Animal } from '../data/types'

const animals: Animal[] = animalsData
const categories = categoriesData as { id: string; name: string; emoji: string }[]
const allCategoryIds = ['all', ...categories.map(c => c.id)]

/* Утилита: перемешать массив (Fisher-Yates) */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

interface OutletCtx {
  autoplayActive: boolean
  toggleAutoplay: () => void
  toggleCheatsheet: () => void
  closeCheatsheet: () => void
  toggleSettings: () => void
  closeSettings: () => void
  shuffleActive: boolean
  toggleShuffle: () => void
}

export default function HomePage() {
  const {
    toggleCheatsheet, closeCheatsheet,
    toggleSettings, closeSettings,
    shuffleActive, toggleShuffle,
    autoplayActive, toggleAutoplay,
  } = useOutletContext<OutletCtx>()
  const settings = useSettings()
  const stageRef = useRef<AnimalStageHandle>(null)
  const isPlayingRef = useRef(false)

  const [activeCategory, setActiveCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  /* Фильтрация по категории */
  const baseFiltered = useMemo(() => {
    return activeCategory === 'all'
      ? animals
      : animals.filter(a => a.categories.includes(activeCategory))
  }, [activeCategory])

  /* Если включён shuffle — перемешиваем */
  const filtered = useMemo(() => {
    if (!shuffleActive) return baseFiltered
    return shuffleArray(baseFiltered)
    // shuffleSeed используется чтобы пересчитать при нажатии «Случайно» ещё раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFiltered, shuffleActive, shuffleSeed])

  const safeIndex = filtered.length > 0 ? currentIndex % filtered.length : 0
  const animal = filtered[safeIndex] || animals[0]

  /* При изменении shuffle или категории — на первую */
  useEffect(() => {
    setCurrentIndex(0)
  }, [shuffleActive, shuffleSeed, activeCategory])

  /* Навигация с блокировкой во время звука */
  const goNext = useCallback(() => {
    if (isPlayingRef.current) return
    setCurrentIndex(i => {
      const next = i + 1
      if (next >= filtered.length) return settings.loopNavigation ? 0 : i
      return next
    })
  }, [filtered.length, settings.loopNavigation])

  const goPrev = useCallback(() => {
    if (isPlayingRef.current) return
    setCurrentIndex(i => {
      const prev = i - 1
      if (prev < 0) return settings.loopNavigation ? filtered.length - 1 : i
      return prev
    })
  }, [filtered.length, settings.loopNavigation])

  const goFirst = useCallback(() => {
    if (isPlayingRef.current) return
    setCurrentIndex(0)
  }, [])

  const goLast = useCallback(() => {
    if (isPlayingRef.current) return
    setCurrentIndex(filtered.length - 1)
  }, [filtered.length])

  const handlePlayStateChange = useCallback((playing: boolean) => {
    isPlayingRef.current = playing
  }, [])

  const handlePlay = useCallback(() => {
    stageRef.current?.playSound()
  }, [])

    /* Автоплей при смене карточки */
  useEffect(() => {
    if (!autoplayActive || !settings.autoplay) return
    const timer = setTimeout(() => {
      stageRef.current?.playSound()
    }, settings.autoplayDelay)
    return () => clearTimeout(timer)
  }, [animal.id, autoplayActive, settings.autoplay, settings.autoplayDelay])

  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id)
    setCurrentIndex(0)
    // При переключении — пересчитываем shuffle
    if (shuffleActive) setShuffleSeed(s => s + 1)
  }, [shuffleActive])

  const handleCategoryByNumber = useCallback((index: number) => {
    if (index < allCategoryIds.length) handleCategoryChange(allCategoryIds[index])
  }, [handleCategoryChange])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  const handleMute = useCallback(() => {
    settings.update('volume', settings.volume > 0 ? 0 : 80)
  }, [settings])

    /* Автопереход — ждёт окончания звука */
  useEffect(() => {
    if (!settings.autoNext || !autoplayActive) return
    const timer = setInterval(() => {
      if (isPlayingRef.current) return
      setCurrentIndex(i => (i + 1) % filtered.length)
    }, settings.autoNextInterval * 1000)
    return () => clearInterval(timer)
  }, [settings.autoNext, settings.autoNextInterval, filtered.length, autoplayActive])

  useKeyboard({
    onNext: goNext,
    onPrev: goPrev,
    onPlay: handlePlay,
    onMute: handleMute,
    onSettings: toggleSettings,
    onFullscreen: handleFullscreen,
    onFirst: goFirst,
    onLast: goLast,
    onCheatsheet: toggleCheatsheet,
    onEscape: useCallback(() => { closeCheatsheet(); closeSettings() }, [closeCheatsheet, closeSettings]),
    onCategory: handleCategoryByNumber,
  })

  const swipeHandlers = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev })

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }} {...swipeHandlers}>
      <CategoryBar active={activeCategory} onChange={handleCategoryChange} />
      <AnimalStage
        ref={stageRef}
        animal={animal}
        index={safeIndex}
        total={filtered.length}
        onPrev={goPrev}
        onNext={goNext}
        muted={settings.volume === 0}
        volume={settings.volume / 100}
        transitionType={settings.transitionType}
        onPlayStateChange={handlePlayStateChange}
        playAllVariants={settings.playAllVariants}
      />
    </div>
  )
}