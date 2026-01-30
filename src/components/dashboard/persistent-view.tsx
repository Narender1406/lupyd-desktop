import { useLayoutEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

interface PersistentViewProps {
    children: React.ReactNode
    path: string
}

export function PersistentView({ children, path }: PersistentViewProps) {
    const location = useLocation()
    const isActive = location.pathname === path
    const scrollPosRef = useRef(0)
    const contentRef = useRef<HTMLDivElement>(null)

    // Use layout effect to handle scroll restoration synchronously before paint
    useLayoutEffect(() => {
        if (isActive && contentRef.current) {
            // We are showing the view
            // Restore scroll position instantly
            window.scrollTo(0, scrollPosRef.current)
        } else if (!isActive) {
            // We are hiding the view
            // Save current scroll position
            scrollPosRef.current = window.scrollY
        }
    }, [isActive])

    return (
        <div
            ref={contentRef}
            style={{
                display: isActive ? 'block' : 'none',
                // Ensure it takes full width when visible
                width: '100%'
            }}
        >
            {children}
        </div>
    )
}
