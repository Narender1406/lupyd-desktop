import DashboardPage from "@/app/dashboard/page"
import { useLocation, Outlet } from "react-router-dom"

export function PersistentShell() {
    const location = useLocation()
    const isHome = location.pathname === '/'

    return (
        <>
            <div style={{ display: isHome ? 'block' : 'none' }}>
                <DashboardPage />
            </div>
            <Outlet />
        </>
    )
}
