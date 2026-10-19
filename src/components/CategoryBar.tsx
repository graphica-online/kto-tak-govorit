import { motion } from 'framer-motion'
import categoriesData from '../data/categories.json'
import animalsData from '../data/animals.json'

interface Props {
  active: string
  onChange: (id: string) => void
}

const categories = categoriesData as { id: string; name: string; emoji: string }[]
const animals = animalsData as { categories: string[] }[]

export default function CategoryBar({ active, onChange }: Props) {
  const allCount = animals.length

  const items = [
    { id: 'all', emoji: '🎲', name: 'Все', count: allCount },
    ...categories.map(c => ({
      ...c,
      count: animals.filter(a => a.categories.includes(c.id)).length,
    })),
  ]

  return (
    <div style={{
      padding: '16px 24px',
      display: 'flex', flexWrap: 'wrap', gap: 8,
      borderBottom: '1px solid var(--c-border)',
      background: 'var(--c-bg)',
    }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              background: isActive ? 'var(--c-brand)' : 'var(--c-bg-soft)',
              color: isActive ? '#fff' : 'var(--c-text-strong)',
              border: isActive ? '1px solid var(--c-brand)' : '1px solid var(--c-border)',
              boxShadow: isActive ? 'var(--shadow-brand)' : 'none',
              overflow: 'hidden',
            }}
          >
            {/* Анимированная подсветка активного */}
            {isActive && (
              <motion.div
                layoutId="bubble-highlight"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--c-brand)',
                  borderRadius: 999,
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, fontSize: 18 }}>{item.emoji}</span>
            <span style={{ position: 'relative', zIndex: 1 }}>{item.name}</span>
            <span style={{ position: 'relative', zIndex: 1, fontSize: 12, opacity: 0.7 }}>{item.count}</span>
          </motion.button>
        )
      })}
    </div>
  )
}