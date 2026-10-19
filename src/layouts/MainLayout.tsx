import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import HotkeyCheatsheet from '../components/HotkeyCheatsheet'
import SettingsPanel from '../components/SettingsPanel'
import { useSettings } from '../store/useSettings'

export default function MainLayout() {
  /* ═══ Состояния панелей ═══ */
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shuffleActive, setShuffleActive] = useState(false)
  const [autoplayActive, setAutoplayActive] = useState(true)

  /* ═══ Настройки из Zustand ═══ */
  const settings = useSettings()

  /* ═══ Синхронизация темы ═══ */
  useEffect(() => {
    const html = document.documentElement
    if (settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.dataset.theme = prefersDark ? 'dark' : ''
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        html.dataset.theme = e.matches ? 'dark' : ''
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      html.dataset.theme = settings.theme === 'dark' ? 'dark' : ''
    }
  }, [settings.theme])

  /* ═══ Синхронизация акцентного цвета ═══ */
  useEffect(() => {
    document.body.dataset.accent = settings.accentColor
  }, [settings.accentColor])

  /* ═══ Синхронизация автоплея с настройками ═══ */
  useEffect(() => {
    setAutoplayActive(settings.autoplay)
  }, [settings.autoplay])

  /* ═══ Toggle-функции ═══ */
  const toggleCheatsheet = useCallback(() => setCheatsheetOpen(o => !o), [])
  const closeCheatsheet = useCallback(() => setCheatsheetOpen(false), [])

  const toggleSettings = useCallback(() => setSettingsOpen(o => !o), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const toggleShuffle = useCallback(() => setShuffleActive(s => !s), [])

  const toggleAutoplay = useCallback(() => {
    setAutoplayActive(prev => {
      const next = !prev
      settings.update('autoplay', next)
      return next
    })
  }, [settings])

  /* ═══ Рендер ═══ */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--c-bg-soft)' }}>

      <Navbar
        onOpenCheatsheet={toggleCheatsheet}
        onOpenSettings={toggleSettings}
        onShuffle={toggleShuffle}
        shuffleActive={shuffleActive}
        onToggleAutoplay={toggleAutoplay}
        autoplayActive={autoplayActive}
      />

      <main style={{ flex: 1 }}>
        <Outlet context={{
          toggleCheatsheet,
          closeCheatsheet,
          toggleSettings,
          closeSettings,
          shuffleActive,
          toggleShuffle,
          autoplayActive,
          toggleAutoplay,
        }} />
      </main>

      <HotkeyCheatsheet isOpen={cheatsheetOpen} onClose={closeCheatsheet} />
      <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />

    </div>
  )
}