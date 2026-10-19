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
    shuffleActive,
    autoplayActive,
  } = useOutletContext<OutletCtx>()

  const settings = useSettings()
  const stageRef = useRef<AnimalStageHandle>(null)
  const isPlayingRef = useRef(false)

  const [activeCategory, setActiveCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const baseFiltered = useMemo(() => {
    if (activeCategory === 'all') return animals
    return animals.filter(a => a.categories.includes(activeCategory))
  }, [activeCategory])

  const filtered = useMemo(() => {
    if (!shuffleActive) return baseFiltered
    return shuffleArray(baseFiltered)
  }, [baseFiltered, shuffleActive, shuffleSeed])

  const animal = filtered[currentIndex] ?? filtered[0] ?? animals[0]

  useEffect(() => {
    setCurrentIndex(0)
  }, [activeCategory, shuffleActive, shuffleSeed])

  const goNext = useCallback(() => {
    setCurrentIndex(i => {
      if (i >= filtered.length - 1) {
        return settings.loopNavigation ? 0 : i
      }
      return i + 1
    })
  }, [filtered.length, settings.loopNavigation])

  const goPrev = useCallback(() => {
    setCurrentIndex(i => {
      if (i <= 0) {
        return settings.loopNavigation ? filtered.length - 1 : 0
      }
      return i - 1
    })
  }, [filtered.length, settings.loopNavigation])

  const playSound = useCallback(() => {
    stageRef.current?.playSound()
  }, [])

  /* Автоплей — звук */
  useEffect(() => {
    if (!autoplayActive || !settings.autoplay) return
    const timer = setTimeout(() => {
      if (!isPlayingRef.current && stageRef.current) {
        isPlayingRef.current = true
        stageRef.current.playSound()
        setTimeout(() => { isPlayingRef.current = false }, 2000)
      }
    }, settings.autoplayDelay)
    return () => clearTimeout(timer)
  }, [animal?.id, autoplayActive, settings.autoplay, settings.autoplayDelay])

  /* Авто-переход к следующему */
  useEffect(() => {
    if (!settings.autoNext || !autoplayActive) return
    if (filtered.length <= 1) return
    const timer = setInterval(goNext, settings.autoNextInterval)
    return () => clearInterval(timer)
  }, [settings.autoNext, settings.autoNextInterval, filtered.length, autoplayActive, goNext])

  /* Клавиатура — правильные имена колбэков */
  useKeyboard({
    onNext: goNext,
    onPrev: goPrev,
    onPlay: playSound,
    onCheatsheet: toggleCheatsheet,
    onEscape: closeCheatsheet,
    onSettings: toggleSettings,
    onMute: () => settings.update('volume', settings.volume === 0 ? 80 : 0),
  })

  useSwipe({ onLeft: goNext, onRight: goPrev })

  if (!animal) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <AnimalStage
        ref={stageRef}
        animal={animal}
        index={currentIndex}
        total={filtered.length}
        onPrev={goPrev}
        onNext={goNext}
        muted={settings.volume === 0}
        volume={settings.volume / 100}
        transitionType={settings.transitionType}
        playAllVariants={settings.playAllVariants}
      />
      <CategoryBar
        categories={categories}
        activeId={activeCategory}
        onChange={setActiveCategory}
        allCategoryIds={allCategoryIds}
        showSilent={settings.showSilent}
      />
    </div>
  )
}