import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'

import { useAuth0 } from '@auth0/auth0-react'
import { App as CapApp } from "@capacitor/app"
import { Browser } from "@capacitor/browser"
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link"
import { useAuth } from './context/auth-context'
import { EncryptionPlugin } from './context/encryption-plugin'

import { isTauri } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import CommunityPage from './app/(landing)/community/page'
import CreatorToolsPage from './app/(landing)/creator-tools/page'
import ExperiencePage from './app/(landing)/experience/page'
import FeaturesPage from './app/(landing)/features/page'
import LandingPage from './app/(landing)/page'
import PrivacyPage from './app/(landing)/privacy/page'
import AssignUsernamePage from './app/assignUsername'
import BlockedAccountsPage from './app/blocked-accounts/page'
import ConnectionsPage from './app/dashboard/connections/page'
import CreatePostPage from './app/dashboard/create-post/page'
import DiscoverPage from './app/dashboard/discover/page'
import GroupChannelsPage from './app/dashboard/groups/[id]/channels/page'
import GroupInfoPage from './app/dashboard/groups/[id]/info/page'
import GroupWorkspaceRoutePage from './app/dashboard/groups/[id]/page'
import GroupSettingsPage from './app/dashboard/groups/[id]/settings/page'
import CreateGroupPage from './app/dashboard/groups/create/page'
import GroupsPage from './app/dashboard/groups/page'
import UserCallPage from './app/dashboard/messages/[username]/call/page'
import UserMessagePage from './app/dashboard/messages/[username]/page'
import MessagesPage from './app/dashboard/messages/page'
import NotificationsPage from './app/dashboard/notification/notifications-page'
import DashboardPage from './app/dashboard/page'
import PostPage from './app/dashboard/post/[postId]/page'
import SavedPostsPage from './app/dashboard/saved-posts/page'
import SettingsPage from './app/dashboard/settings/page'
import ProfilePage from './app/dashboard/user/[username]/page'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfUse from './components/TermsOfUse'

// ─── Style helper ──────────────────────────────────────────────────────────
// Shows a page when active; hides it (without unmounting) otherwise.
const pageStyle = (active: boolean): React.CSSProperties => ({
  display: active ? 'block' : 'none',
})

function App() {
  const { handleRedirectCallback } = useAuth0()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  // ─── Deep link / OAuth redirect handler ────────────────────────────────
  const onDeeplinkUrl = async ({ url }: { url: string }) => {
    const redirectUrl =
      process.env.NEXT_PUBLIC_JS_ENV_AUTH0_REDIRECT_CALLBACK ??
      `${window.location.origin}/signin`
    console.log(`RECEIVED A DEEPLINK ${url}`)
    if (url.startsWith(redirectUrl)) {
      if (url.includes('code') || url.includes('error')) {
        await auth.handleRedirectCallback(url)
      }
      if (!isTauri()) {
        await Browser.close()
      }
    } else if (url.startsWith('lupyd://m.lupyd.com')) {
      const link = new URL(url)
      navigate({ pathname: link.pathname, search: link.search })
    }
  }

  useEffect(() => {
    EncryptionPlugin.requestAllPermissions({ permissions: ['camera', 'mic', 'notification'] })
  })

  useEffect(() => {
    const unlisten = isTauri()
      ? listen('appUrlOpen', (data) => {
        console.log({ listenData: data })
        onDeeplinkUrl({ url: data.payload as string })
      })
      : CapApp.addListener('appUrlOpen', onDeeplinkUrl).then((e) => e.remove)
    return () => { unlisten.then((_) => _()) }
  }, [handleRedirectCallback])

  useEffect(() => {
    if (isTauri()) {
      const unlisten = onOpenUrl((urls) => {
        console.log({ openUrls: urls })
        for (const url of urls) onDeeplinkUrl({ url })
      })
      return () => { unlisten.then((_) => _()) }
    }
  }, [handleRedirectCallback])

  useEffect(() => {
    ; (async () => {
      if (isTauri()) {
        const startUrls = await getCurrent()
        console.log({ startUrls })
        if (startUrls && startUrls.length > 0) {
          for (const url of startUrls) onDeeplinkUrl({ url })
        }
      }
      const url = await CapApp.getLaunchUrl()
      if (!url) return
      onDeeplinkUrl(url)
    })()
  }, [])
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Keep-alive mount tracking ────────────────────────────────────────
  // A page is added to mountedPaths the first time it becomes the current
  // path. It is never removed — its component stays in the DOM forever,
  // just toggled visible/hidden via display.
  //
  // IMPORTANT: we initialise with currentPath already in the Set AND we
  // check `|| p === currentPath` in isMounted(). This guarantees that the
  // very first render of a new path is never skipped — eliminating the
  // "blank first visit" race that occurs when using useEffect for tracking.
  const [mountedPaths, setMountedPaths] = useState<Set<string>>(
    () => new Set([currentPath])
  )
  useEffect(() => {
    setMountedPaths((prev) => {
      if (prev.has(currentPath)) return prev   // no re-render if already tracked
      return new Set(prev).add(currentPath)
    })
  }, [currentPath])

  // ─── Scroll save / restore ────────────────────────────────────────────
  const scrollPositions = useRef<Map<string, number>>(new Map())

  useLayoutEffect(() => {
    const save = () => scrollPositions.current.set(currentPath, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [currentPath])

  useLayoutEffect(() => {
    const saved = scrollPositions.current.get(currentPath) ?? 0
    window.scrollTo(0, saved)
  }, [currentPath])
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Route helpers ────────────────────────────────────────────────────
  // isMounted: returns true if this path has ever been visited OR is current.
  // The `|| p === currentPath` is the critical fix — the current path is
  // always considered mounted even before the async useEffect fires.
  const isMounted = (p: string) => mountedPaths.has(p) || p === currentPath

  // isMountedPrefix: same logic for prefix-matched routes (e.g. /discover/*)
  const isMountedPrefix = (p: string) =>
    Array.from(mountedPaths).some((m) => m.startsWith(p)) ||
    currentPath.startsWith(p)

  // isMountedPattern: same logic for parameterised routes (e.g. /groups/:id)
  const isMountedPattern = (pattern: string) => {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, '[^/]+')}$`)
    return Array.from(mountedPaths).some((m) => regex.test(m)) || regex.test(currentPath)
  }

  // active helpers — control display:block vs display:none
  const is = (p: string) => currentPath === p
  const startsWith = (p: string) => currentPath.startsWith(p)
  const matches = (pattern: string) =>
    new RegExp(`^${pattern.replace(/:\w+/g, '[^/]+')}$`).test(currentPath)
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Landing / Marketing ──────────────────────────────────────────── */}
      {isMounted('/about/') && (
        <div style={pageStyle(is('/about/'))}><LandingPage /></div>
      )}
      {isMounted('/about/community') && (
        <div style={pageStyle(is('/about/community'))}><CommunityPage /></div>
      )}
      {isMounted('/about/features') && (
        <div style={pageStyle(is('/about/features'))}><FeaturesPage /></div>
      )}
      {isMounted('/about/experience') && (
        <div style={pageStyle(is('/about/experience'))}><ExperiencePage /></div>
      )}
      {isMounted('/about/creator-tools') && (
        <div style={pageStyle(is('/about/creator-tools'))}><CreatorToolsPage /></div>
      )}
      {isMounted('/about/privacy') && (
        <div style={pageStyle(is('/about/privacy'))}><PrivacyPage /></div>
      )}

      {/* ── Auth ──────────────────────────────────────────────────────────── */}
      {isMounted('/signin') && (
        <div style={pageStyle(is('/signin'))}><AssignUsernamePage /></div>
      )}

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      {isMounted('/') && (
        <div style={pageStyle(is('/'))}><DashboardPage /></div>
      )}
      {isMounted('/saved-posts') && (
        <div style={pageStyle(is('/saved-posts'))}><SavedPostsPage /></div>
      )}
      {isMounted('/create-post') && (
        <div style={pageStyle(is('/create-post'))}><CreatePostPage /></div>
      )}
      {isMounted('/connections') && (
        <div style={pageStyle(is('/connections'))}><ConnectionsPage /></div>
      )}
      {isMounted('/settings') && (
        <div style={pageStyle(is('/settings'))}><SettingsPage /></div>
      )}
      {isMounted('/blocked-accounts') && (
        <div style={pageStyle(is('/blocked-accounts'))}><BlockedAccountsPage /></div>
      )}

      {/* ── Groups — specific patterns before generic :id ─────────────────── */}
      {isMountedPattern('/groups/create') && (
        <div style={pageStyle(matches('/groups/create'))}><CreateGroupPage /></div>
      )}
      {isMountedPattern('/groups/:id/settings') && (
        <div style={pageStyle(matches('/groups/:id/settings'))}><GroupSettingsPage /></div>
      )}
      {isMountedPattern('/groups/:id/info') && (
        <div style={pageStyle(matches('/groups/:id/info'))}><GroupInfoPage /></div>
      )}
      {isMountedPattern('/groups/:id/channels') && (
        <div style={pageStyle(matches('/groups/:id/channels'))}><GroupChannelsPage /></div>
      )}
      {isMountedPattern('/groups/:id') && (
        <div style={pageStyle(
          matches('/groups/:id') &&
          !matches('/groups/create') &&
          !currentPath.includes('/settings') &&
          !currentPath.includes('/info') &&
          !currentPath.includes('/channels')
        )}>
          <GroupWorkspaceRoutePage />
        </div>
      )}
      {isMounted('/groups') && (
        <div style={pageStyle(is('/groups'))}><GroupsPage /></div>
      )}

      {/* ── Discover ─────────────────────────────────────────────────────── */}
      {isMountedPrefix('/discover') && (
        <div style={pageStyle(startsWith('/discover'))}><DiscoverPage /></div>
      )}

      {/* ── Posts ────────────────────────────────────────────────────────── */}
      {isMountedPattern('/post/:id') && (
        <div style={pageStyle(matches('/post/:id'))}><PostPage /></div>
      )}

      {/* ── User Profiles ────────────────────────────────────────────────── */}
      {isMountedPattern('/user/:username') && (
        <div style={pageStyle(matches('/user/:username'))}><ProfilePage /></div>
      )}

      {/* ── Messages — call route before DM route ────────────────────────── */}
      {isMountedPattern('/messages/:username/call') && (
        <div style={pageStyle(matches('/messages/:username/call'))}><UserCallPage /></div>
      )}
      {isMountedPattern('/messages/:username') && (
        <div style={pageStyle(
          matches('/messages/:username') && !currentPath.includes('/call')
        )}>
          <UserMessagePage />
        </div>
      )}
      {isMounted('/messages') && (
        <div style={pageStyle(is('/messages'))}><MessagesPage /></div>
      )}

      {/* ── Notifications ───────────────────────────────────────────────── */}
      {isMountedPrefix('/notification') && (
        <div style={pageStyle(startsWith('/notification'))}><NotificationsPage /></div>
      )}

      {/* ── Legal ────────────────────────────────────────────────────────── */}
      {isMounted('/terms-of-use') && (
        <div style={pageStyle(is('/terms-of-use'))}><TermsOfUse /></div>
      )}
      {isMounted('/privacy') && (
        <div style={pageStyle(is('/privacy'))}><PrivacyPolicy /></div>
      )}
    </>
  )
}

export default App
