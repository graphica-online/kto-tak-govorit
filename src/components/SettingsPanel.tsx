import { motion, AnimatePresence } from 'framer-motion'
import { useSettings, type TransitionType, type ThemeMode, type AccentColor } from '../store/useSettings'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const accents: { value: AccentColor; label: string; color: string }[] = [
  { value: 'red', label: 'Красный', color: 'hsl(0,100%,55%)' },
  { value: 'orange', label: 'Оранжевый', color: 'hsl(25,100%,55%)' },
  { value: 'amber', label: 'Янтарный', color: 'hsl(38,100%,50%)' },
  { value: 'green', label: 'Зелёный', color: 'hsl(145,100%,42%)' },
  { value: 'teal', label: 'Бирюза', color: 'hsl(175,100%,40%)' },
  { value: 'blue', label: 'Синий', color: 'hsl(215,100%,55%)' },
  { value: 'indigo', label: 'Индиго', color: 'hsl(240,100%,65%)' },
  { value: 'purple', label: 'Фиолет', color: 'hsl(270,100%,60%)' },
  { value: 'pink', label: 'Розовый', color: 'hsl(330,100%,60%)' },
]

const transitions: { value: TransitionType; label: string; desc: string }[] = [
  { value: 'smooth', label: 'Плавный', desc: 'Slide + fade' },
  { value: 'simple', label: 'Простой', desc: 'Только fade' },
  { value: 'none', label: 'Без анимации', desc: 'Мгновенно' },
]

const themes: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Авто (система)' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--c-brand)' : 'var(--c-border-strong)',
        position: 'relative', transition: 'background .25s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        boxShadow: '0 2px 6px rgba(0,0,0,.2)', transition: 'left .25s',
      }} />
    </button>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, padding: '14px 0', borderBottom: '1px solid var(--c-border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text-strong)' }}>{label}</div>
        {desc && <div style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      color: 'var(--c-text-dim)', marginTop: 20, marginBottom: 4,
    }}>
      {children}
    </div>
  )
}

export default function SettingsPanel({ isOpen, onClose }: Props) {
  const settings = useSettings()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              width: '100%', maxWidth: 480, maxHeight: '85vh',
              borderRadius: 28, padding: 28,
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-text-strong)' }}>⚙ Настройки</h3>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--c-bg-soft)', border: 'none',
                  cursor: 'pointer', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--c-text-muted)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Воспроизведение */}
            <GroupTitle>Воспроизведение</GroupTitle>
            
            <Row label="Задержка автоплея" desc={`${settings.autoplayDelay} мс`}>
              <input
                type="range" min={0} max={3000} step={100}
                value={settings.autoplayDelay}
                onChange={e => settings.update('autoplayDelay', Number(e.target.value))}
                style={{ width: 120, accentColor: 'var(--c-brand)' }}
              />
            </Row>
                        <Row label="Все варианты звука" desc="Проигрывать все записи подряд, а не одну случайную">
              <Toggle checked={settings.playAllVariants} onChange={v => settings.update('playAllVariants', v)} />
            </Row>
            <Row label="Громкость" desc={`${settings.volume}%`}>
              <input
                type="range" min={0} max={100} step={5}
                value={settings.volume}
                onChange={e => settings.update('volume', Number(e.target.value))}
                style={{ width: 120, accentColor: 'var(--c-brand)' }}
              />
            </Row>

            {/* Навигация */}
            <GroupTitle>Навигация</GroupTitle>
            <Row label="Автопереход" desc="Слайд-шоу">
              <Toggle checked={settings.autoNext} onChange={v => settings.update('autoNext', v)} />
            </Row>
            {settings.autoNext && (
              <Row label="Интервал" desc={`${settings.autoNextInterval} сек`}>
                <input
                  type="range" min={3} max={60} step={1}
                  value={settings.autoNextInterval}
                  onChange={e => settings.update('autoNextInterval', Number(e.target.value))}
                  style={{ width: 120, accentColor: 'var(--c-brand)' }}
                />
              </Row>
            )}
            <Row label="Циклическая навигация" desc="После последнего → первое">
              <Toggle checked={settings.loopNavigation} onChange={v => settings.update('loopNavigation', v)} />
            </Row>

            {/* Внешний вид */}
            <GroupTitle>Внешний вид</GroupTitle>
            <Row label="Тема">
              <select
                value={settings.theme}
                onChange={e => settings.update('theme', e.target.value as ThemeMode)}
                style={{
                  padding: '6px 12px', borderRadius: 10,
                  border: '1px solid var(--c-border-strong)',
                  background: 'var(--c-bg)', color: 'var(--c-text-strong)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Row>
            <Row label="Акцентный цвет">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {accents.map(a => (
                  <button
                    key={a.value}
                    onClick={() => settings.update('accentColor', a.value)}
                    title={a.label}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: a.color, border: 'none', cursor: 'pointer',
                      outline: settings.accentColor === a.value ? '3px solid var(--c-text-strong)' : '2px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline .15s',
                    }}
                  />
                ))}
              </div>
            </Row>
            <Row label="Переход между карточками">
              <select
                value={settings.transitionType}
                onChange={e => settings.update('transitionType', e.target.value as TransitionType)}
                style={{
                  padding: '6px 12px', borderRadius: 10,
                  border: '1px solid var(--c-border-strong)',
                  background: 'var(--c-bg)', color: 'var(--c-text-strong)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {transitions.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
              </select>
            </Row>
            <Row label="Показывать без звука" desc="Бабочка, улитка и др.">
              <Toggle checked={settings.showSilent} onChange={v => settings.update('showSilent', v)} />
            </Row>

            {/* Прочее */}
            <GroupTitle>Прочее</GroupTitle>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 8 }}>
              <button
                onClick={() => {
                  settings.reset()
                  document.body.dataset.accent = 'red'
                }}
                style={{
                  padding: '10px 20px', borderRadius: 14,
                  background: 'transparent', border: '1px solid var(--c-border-strong)',
                  color: 'var(--c-text-strong)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Сбросить всё
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}