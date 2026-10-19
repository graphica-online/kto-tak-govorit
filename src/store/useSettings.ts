import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransitionType = 'simple' | 'smooth' | 'none'
export type ThemeMode = 'light' | 'dark' | 'auto'
export type AccentColor = 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'

interface SettingsState {
  autoplay: boolean
  autoplayDelay: number
  volume: number
  autoNext: boolean
  autoNextInterval: number
  loopNavigation: boolean
  theme: ThemeMode
  accentColor: AccentColor
  showSilent: boolean
    playAllVariants: boolean
  transitionType: TransitionType
  update: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  reset: () => void
}

const defaults = {
  autoplay: true,
  autoplayDelay: 400,
  volume: 80,
  autoNext: false,
  autoNextInterval: 10,
  loopNavigation: false,
  theme: 'auto' as ThemeMode,
  accentColor: 'red' as AccentColor,
  showSilent: true,
  playAllVariants: false,
  transitionType: 'smooth' as TransitionType,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      update: (key, value) => set({ [key]: value }),
      reset: () => set(defaults),
    }),
    { name: 'app.settings.v1' }
  )
)