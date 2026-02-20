import { useLocation } from "react-router-dom"

/**
 * Extracts named route params from the current location.pathname.
 * Use this instead of useParams() since pages in App.tsx are not wrapped in <Route> elements.
 *
 * @example
 * // Current path: /groups/42/channels
 * const { id } = usePathParams('/groups/:id/channels')
 * // id === "42"
 */
export function usePathParams<T extends Record<string, string>>(pattern: string): Partial<T> {
    const location = useLocation()
    const pathname = location.pathname

    // Build a regex from the pattern, capturing named segments
    const paramNames: string[] = []
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name)
        return "([^/]+)"
    })

    const regex = new RegExp(`^${regexStr}`)
    const match = pathname.match(regex)

    if (!match) return {} as Partial<T>

    const params: Record<string, string> = {}
    paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
    })

    return params as Partial<T>
}
