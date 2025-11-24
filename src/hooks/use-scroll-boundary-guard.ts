import { useEffect } from 'react'

/**
 * A hook that prevents scrolling past the edges of a scrollable container.
 * This eliminates the "rubber band" effect on mobile devices when scrolling beyond boundaries.
 * 
 * @param ref - A React ref pointing to the scrollable container element
 */
export function useScrollBoundaryGuard<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight
      
      // Determine scroll direction
      const isScrollingUp = currentY > startY // Dragging finger down
      const isScrollingDown = currentY < startY // Dragging finger up

      // 1. If at TOP and dragging DOWN -> Block it (Prevents top body bounce)
      if (isScrollingUp && scrollTop <= 0) {
        e.preventDefault()
      }

      // 2. If at BOTTOM and dragging UP -> Block it (Prevents bottom body scroll)
      // We use a 1px buffer (-1) to be safe
      if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
        e.preventDefault()
      }
    }

    // IMPORTANT: { passive: false } is required to use preventDefault()
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [ref])
}