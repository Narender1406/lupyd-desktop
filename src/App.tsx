import { useEffect } from 'react'
import { Route, Routes, useNavigate  } from 'react-router-dom'
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





function App() {

  const { handleRedirectCallback } = useAuth0();
  const auth = useAuth();
  const navigate = useNavigate()


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


  console.log(`App redrew`)

  return (
    <Routes>
      <Route path="/about/" element={<LandingPage />} />
      <Route path="/about/community" element={<CommunityPage />} />
      <Route path="/about/features" element={<FeaturesPage />} />
      <Route path="/about/experience" element={<ExperiencePage />} />
      <Route path="/about/creator-tools" element={<CreatorToolsPage />} />
      <Route path="/about/privacy" element={<PrivacyPage />} />
      <Route path="/signin" element={<AssignUsernamePage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/saved-posts" element={<SavedPostsPage />} />
      <Route path="/create-post" element={<CreatePostPage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/blocked-accounts" element={<BlockedAccountsPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/groups/create" element={<CreateGroupPage />} />
      <Route path="/groups/:id" element={<GroupWorkspaceRoutePage />} />
      <Route path="/groups/:id/settings" element={<GroupSettingsPage />} />
      <Route path="/groups/:id/info" element={<GroupInfoPage />} />
      <Route path="/groups/:id/channels" element={<GroupChannelsPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/post/:postId" element={<PostPage />} />
      <Route path="/user/:username" element={<ProfilePage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:username" element={<UserMessagePage />} />
      <Route path="/messages/:username/call" element={<UserCallPage />} />
      <Route path="/notification" element={<NotificationsPage />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  )
}

export default App
