import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const hotkeys = [
  { keys: '→  ↓  D', action: 'Следующее животное' },
  { keys: '←  ↑  A', action: 'Предыдущее животное' },
  { keys: 'Space  Enter', action: 'Проиграть звук' },
  { keys: 'M', action: 'Mute / Unmute' },
  { keys: '+  −', action: 'Громкость ±5%' },
  { keys: 'S', action: 'Открыть настройки' },
  { keys: 'F', action: 'Полноэкранный режим' },
  { keys: 'Home  End', action: 'Первое / последнее' },
  { keys: '1 – 9', action: 'Выбрать категорию' },
  { keys: '?  H', action: 'Эта шпаргалка' },
  { keys: 'Esc', action: 'Закрыть' },
]

export default function HotkeyCheatsheet({ isOpen, onClose }: Props) {
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
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--c-bg)',
              borderRadius: 28,
              padding: 32,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 30px 80px rgba(0,0,0,.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-text-strong)' }}>
                ⌨️ Горячие клавиши
              </h3>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hotkeys.map(h => (
                <div
                  key={h.keys}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 10,
                    background: 'var(--c-bg-soft)',
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--c-text-muted)' }}>{h.action}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {h.keys.split('  ').map(k => (
                      <kbd
                        key={k}
                        style={{
                          padding: '3px 8px',
                          background: 'var(--c-bg)',
                          border: '1px solid var(--c-border-strong)',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--c-text-strong)',
                          boxShadow: '0 1px 2px rgba(0,0,0,.08)',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--c-text-dim)', textAlign: 'center' }}>
              Нажмите <kbd style={{ padding: '2px 6px', background: 'var(--c-bg-soft)', borderRadius: 4, border: '1px solid var(--c-border)', fontSize: 11 }}>Esc</kbd> или кликните вне окна чтобы закрыть
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}