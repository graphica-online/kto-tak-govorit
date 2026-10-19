import { useEffect, useRef } from 'react'

interface SwipeActions {
  onLeft?: () => void
  onRight?: () => void
}

const MIN_DISTANCE = 50

export function useSwipe(actions: SwipeActions) {
  const startX = useRef(0)
  const startY = useRef(0)
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = e.changedTouches[0].clientY - startY.current

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MIN_DISTANCE) {
        if (dx < 0) {
          actionsRef.current.onLeft?.()
        } else {
          actionsRef.current.onRight?.()
        }
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}