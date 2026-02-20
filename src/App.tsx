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

// Shared style for every page container div — just toggle display
const page = (active: boolean): React.CSSProperties => ({
  display: active ? 'block' : 'none',
})

function App() {

  const { handleRedirectCallback } = useAuth0();
  const auth = useAuth();


  const onDeeplinkUrl = async ({ url }: { url: string }) => {
    const redirectUrl = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_REDIRECT_CALLBACK ?? `${window.location.origin}/signin`
    console.log(`RECEIVED A DEEPLINK ${url}`)
    if (url.startsWith(redirectUrl)) {
      if (
        (url.includes("code") || url.includes("error"))
      ) {
        await auth.handleRedirectCallback(url)
      }

      if (!isTauri()) {
        await Browser.close();
      }

    } else if (url.startsWith("lupyd://m.lupyd.com")) {
      const link = new URL(url)
      navigate({
        pathname: link.pathname,
        search: link.search
      })
    }
  };

  useEffect(() => { EncryptionPlugin.requestAllPermissions({ permissions: ["camera", "mic", "notification"] }) })

  useEffect(() => {


    const unlisten = isTauri() ? listen("appUrlOpen", (data) => { console.log({ listenData: data }); onDeeplinkUrl({ url: data.payload as string }) }) : CapApp.addListener("appUrlOpen", onDeeplinkUrl).then(e => e.remove);

    return () => {
      unlisten.then((_) => _())
    }
  }, [handleRedirectCallback]);

  useEffect(() => {
    if (isTauri()) {
      const unlisten = onOpenUrl((urls) => {

        console.log({ openUrls: urls })
        for (const url of urls) {
          onDeeplinkUrl({ url })
        }
      })

      return () => {
        unlisten.then(_ => _())
      }
    }
  }, [handleRedirectCallback])


  const navigate = useNavigate()

  useEffect(() => {
    (async () => {

      if (isTauri()) {
        const startUrls = await getCurrent();

        console.log({ startUrls })
        if (startUrls && startUrls.length > 0) {
          for (const url of startUrls) {
            onDeeplinkUrl({ url })
          }
        }
      }


      const url = await CapApp.getLaunchUrl()
      if (!url) {
        return
      }
      onDeeplinkUrl(url)
    })()
  }, [])

  const location = useLocation()
  const currentPath = location.pathname

  // Lazy-mount: only render a page after it has been visited at least once
  const [mountedPages, setMountedPages] = useState<Set<string>>(new Set([currentPath]))
  useEffect(() => {
    setMountedPages(prev => new Set(prev).add(currentPath))
  }, [currentPath])

  // ─── Scroll save / restore ────────────────────────────────────────────────
  // Critical ordering: useLayoutEffect cleanups fire BEFORE useLayoutEffect bodies.
  //
  // On path change:
  //   1. cleanup of BOTH useLayoutEffects runs (removes old scroll listener)
  //   2. body of listener useLayoutEffect runs (registers NEW path listener)
  //   3. body of restore useLayoutEffect runs (window.scrollTo → scroll event
  //      caught ONLY by NEW path's listener — saves correct value, not old path)
  //
  // If we used useEffect instead, its cleanup runs AFTER useLayoutEffect bodies,
  // so the OLD listener would catch window.scrollTo's scroll event and save 0
  // to the wrong path (the one we just left).
  const scrollPositions = useRef<Map<string, number>>(new Map())

  useLayoutEffect(() => {
    const save = () => {
      scrollPositions.current.set(currentPath, window.scrollY)
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [currentPath])

  useLayoutEffect(() => {
    const saved = scrollPositions.current.get(currentPath) ?? 0
    window.scrollTo(0, saved)
  }, [currentPath, mountedPages])
  // ─────────────────────────────────────────────────────────────────────────

  // Route helpers
  const is = (p: string) => currentPath === p
  const startsWith = (p: string) => currentPath.startsWith(p)
  const matches = (pattern: string) =>
    new RegExp(`^${pattern.replace(/:\w+/g, '[^/]+')}$`).test(currentPath)

  const mounted = (p: string) => mountedPages.has(p)
  const mountedPrefix = (p: string) => Array.from(mountedPages).some(m => m.startsWith(p))
  const mountedPattern = (pattern: string) => {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, '[^/]+')}$`)
    return Array.from(mountedPages).some(m => regex.test(m)) || regex.test(currentPath)
  }

  return (
    <>
      {/* Landing */}
      {mounted('/about/') && <div style={page(is('/about/'))}><LandingPage /></div>}
      {mounted('/about/community') && <div style={page(is('/about/community'))}><CommunityPage /></div>}
      {mounted('/about/features') && <div style={page(is('/about/features'))}><FeaturesPage /></div>}
      {mounted('/about/experience') && <div style={page(is('/about/experience'))}><ExperiencePage /></div>}
      {mounted('/about/creator-tools') && <div style={page(is('/about/creator-tools'))}><CreatorToolsPage /></div>}
      {mounted('/about/privacy') && <div style={page(is('/about/privacy'))}><PrivacyPage /></div>}

      {/* Auth */}
      {mounted('/signin') && <div style={page(is('/signin'))}><AssignUsernamePage /></div>}

      {/* Dashboard */}
      {mounted('/') && <div style={page(is('/'))}><DashboardPage /></div>}
      {mounted('/saved-posts') && <div style={page(is('/saved-posts'))}><SavedPostsPage /></div>}
      {mounted('/create-post') && <div style={page(is('/create-post'))}><CreatePostPage /></div>}
      {mounted('/connections') && <div style={page(is('/connections'))}><ConnectionsPage /></div>}
      {mounted('/settings') && <div style={page(is('/settings'))}><SettingsPage /></div>}
      {mounted('/blocked-accounts') && <div style={page(is('/blocked-accounts'))}><BlockedAccountsPage /></div>}

      {/* Groups — specific patterns first */}
      {mountedPattern('/groups/create') && (
        <div style={page(matches('/groups/create'))}><CreateGroupPage /></div>
      )}
      {mountedPattern('/groups/[^/]+/settings') && (
        <div style={page(matches('/groups/[^/]+/settings'))}><GroupSettingsPage /></div>
      )}
      {mountedPattern('/groups/[^/]+/info') && (
        <div style={page(matches('/groups/[^/]+/info'))}><GroupInfoPage /></div>
      )}
      {mountedPattern('/groups/[^/]+/channels') && (
        <div style={page(matches('/groups/[^/]+/channels'))}><GroupChannelsPage /></div>
      )}
      {mountedPattern('/groups/[^/]+') && (
        <div style={page(
          matches('/groups/[^/]+') &&
          !matches('/groups/create') &&
          !currentPath.includes('/settings') &&
          !currentPath.includes('/info') &&
          !currentPath.includes('/channels')
        )}>
          <GroupWorkspaceRoutePage />
        </div>
      )}
      {mounted('/groups') && <div style={page(is('/groups'))}><GroupsPage /></div>}

      {/* Discover */}
      {mountedPrefix('/discover') && <div style={page(startsWith('/discover'))}><DiscoverPage /></div>}

      {/* Posts */}
      {mountedPattern('/post/[^/]+') && (
        <div style={page(matches('/post/[^/]+'))}><PostPage /></div>
      )}

      {/* Profiles */}
      {mountedPattern('/user/[^/]+') && (
        <div style={page(matches('/user/[^/]+'))}><ProfilePage /></div>
      )}

      {/* Messages */}
      {mountedPattern('/messages/[^/]+/call') && (
        <div style={page(matches('/messages/[^/]+/call'))}><UserCallPage /></div>
      )}
      {mountedPattern('/messages/[^/]+') && (
        <div style={page(matches('/messages/[^/]+') && !currentPath.includes('/call'))}>
          <UserMessagePage />
        </div>
      )}
      {mounted('/messages') && <div style={page(is('/messages'))}><MessagesPage /></div>}

      {/* Notifications */}
      {mountedPrefix('/notification') && (
        <div style={page(startsWith('/notification'))}><NotificationsPage /></div>
      )}

      {/* Legal */}
      {mounted('/terms-of-use') && <div style={page(is('/terms-of-use'))}><TermsOfUse /></div>}
      {mounted('/privacy') && <div style={page(is('/privacy'))}><PrivacyPolicy /></div>}
    </>
  )
}

export default App
