'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from 'next-themes'

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#030711',
} as const

/** Keeps <meta name="theme-color"> in sync with the active theme. */
function StatusBarThemeSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    const color = resolvedTheme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) {
      meta.content = color
    }
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <StatusBarThemeSync />
      {children}
    </NextThemesProvider>
  )
}
