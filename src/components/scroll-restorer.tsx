import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollRestorer
 *
 * Saves the window scroll position for each pathname and restores it
 * when the user navigates back to that path. Uses useLayoutEffect so
 * the scroll is restored synchronously before the browser paints,
 * preventing any visible scroll jump.
 *
 * Must be rendered inside a <BrowserRouter> (or equivalent).
 * Renders nothing — purely a side-effect component.
 */
export function ScrollRestorer() {
  const { pathname } = useLocation()
  const scrollPositions = useRef<Map<string, number>>(new Map())

  // Save scroll position for the current path on every scroll event.
  // useLayoutEffect so the cleanup (removing the old listener) fires
  // BEFORE the new listener is attached on path change — this prevents
  // the old path's listener from catching the scroll-to-zero that
  // window.scrollTo() triggers during restoration.
  useLayoutEffect(() => {
    const save = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [pathname])

  // Restore saved scroll for the incoming path.
  // Runs after the cleanup of the save-listener effect (guaranteed by
  // useLayoutEffect ordering), so window.scrollTo is only heard by
  // the NEW path's listener.
  useLayoutEffect(() => {
    const saved = scrollPositions.current.get(pathname) ?? 0
    window.scrollTo(0, saved)
  }, [pathname])

  return null
}
