import { useRef } from "react"
import { useLocation } from "react-router-dom"

interface PersistentViewProps {
    children: React.ReactNode
    path: string
}

export function PersistentView({ children, path }: PersistentViewProps) {
    const location = useLocation()
    const isActive = location.pathname === path
    const contentRef = useRef<HTMLDivElement>(null)

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
