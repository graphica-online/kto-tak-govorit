import { useRef, useCallback } from 'react'

interface SwipeActions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

const MIN_DISTANCE = 50

export function useSwipe(actions: SwipeActions) {
  const startX = useRef(0)
  const startY = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current

    // Свайп только если горизонтальное движение больше вертикального
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MIN_DISTANCE) {
      if (dx < 0) {
        actions.onSwipeLeft?.()  // Свайп влево = следующее
      } else {
        actions.onSwipeRight?.() // Свайп вправо = предыдущее
      }
    }
  }, [actions])

  return { onTouchStart, onTouchEnd }
}