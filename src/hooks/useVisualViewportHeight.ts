import { useEffect, useState } from "react"

export function useVisualViewportHeight() {
  const [height, setHeight] = useState(
    typeof window !== "undefined" ? `${window.innerHeight}px` : "100%"
  )

  useEffect(() => {
    if (!window.visualViewport) return

    const update = () => {
      setHeight(`${window.visualViewport!.height}px`)
    }

    update()
    window.visualViewport.addEventListener("resize", update)
    window.visualViewport.addEventListener("scroll", update)

    return () => {
      window.visualViewport?.removeEventListener("resize", update)
      window.visualViewport?.removeEventListener("scroll", update)
    }
  }, [])

  return height
}