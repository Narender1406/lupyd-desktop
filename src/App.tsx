import './App.css'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './components/page-transition'

import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from './context/auth-context';
import FireflyProvider from './context/firefly-context';
import { EncryptionPlugin } from './context/encryption-plugin';




const TermsOfService  = lazy(() => import('./components/ui/TermsOfService'));

const ClientsPage = lazy(() => import('./app/saas/pages/clients-page').then(m => ({ default: m.ClientsPage })));
const ServicesPage = lazy(() => import('./app/saas/pages/services-page').then(m => ({ default: m.ServicesPage })));
const AddClientPage = lazy(() => import('./app/saas/pages/add-client-page').then(m => ({ default: m.AddClientPage })));
const EditClientPage = lazy(() => import('./app/saas/pages/editclient').then(m => ({ default: m.EditClientPage })));
const ApiKeyPage = lazy(() => import('./app/saas/pages/api-key-page').then(m => ({ default: m.ApiKeyPage })));
const ClientDetailsPage = lazy(() => import('./app/saas/pages/clientdetails').then(m => ({ default: m.ClientDetailsPage })));
const AddServicePage = lazy(() => import('./app/saas/pages/add-service-page').then(m => ({ default: m.AddServicePage })));


const OverviewPage = lazy(() => import('./app/saas/pages/overview-page').then(mod => { return { default: mod.OverviewPage } }));

const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));


// const FireflyProvider = lazy(() => import("./context/firefly-context"));
const ActivityPage = lazy(() => import('./app/dashboard/activity/page'));
const AnalyticsPage = lazy(() => import('./app/dashboard/analytics/page'));
const ConnectionsPage = lazy(() => import('./app/dashboard/connections/page'));
const CreatePostPage = lazy(() => import('./app/dashboard/create-post/page'));
const DiscoverPage = lazy(() => import('./app/dashboard/discover/page'));
// const MessagesPage = lazy(() => import('./app/dashboard/messages/page'));
const PostPage = lazy(() => import('./app/dashboard/post/[postId]/page'));
const SavedPostsPage = lazy(() => import('./app/dashboard/saved-posts/page'));
const SettingsPage = lazy(() => import('./app/dashboard/settings/page'));
const ProfilePage = lazy(() => import('./app/dashboard/user/[username]/page'));
const SubscriptionPage = lazy(() => import('./app/dashboard/subscription/page'));
const CheckoutPage = lazy(() => import('./app/dashboard/subscription/checkout/page'));
const NotificationsPage = lazy(() => import('./app/dashboard/notification/notifications-page'));
const AssignUsernamePage = lazy(() => import('./app/assignUsername'));
const DashboardPage = lazy(() => import('./app/dashboard/page'));
const CommunityPage = lazy(() => import('./app/(landing)/community/page'));
const CreatorToolsPage = lazy(() => import('./app/(landing)/creator-tools/page'));
const ExperiencePage = lazy(() => import('./app/(landing)/experience/page'));
const FeaturesPage = lazy(() => import('./app/(landing)/features/page'));
const LandingPage = lazy(() => import('./app/(landing)/page'));
const PrivacyPage = lazy(() => import('./app/(landing)/privacy/page'));
const NotificationTestPage = lazy(() => import('./app/dashboard/notification-test/page'));


const GroupChannelsPage = lazy(() => import('./app/dashboard/groups/[id]/channels/page'));

const GroupsPage = lazy(() => import('./app/dashboard/groups/page'))
const CreateGroupPage = lazy(() => import('./app/dashboard/groups/create/page'))
const GroupSettingsPage = lazy(() => import('./app/dashboard/groups/[id]/settings/page'))
const GroupInfoPage = lazy(() => import('./app/dashboard/groups/[id]/info/page'))
const UserMessagePage = lazy(() => import('./app/dashboard/messages/[username]/page'))
const UserCallPage = lazy(() => import('./app/dashboard/messages/[username]/call/page'))


function LoadingPage() {
  return <div></div>
}


function App() {

  const { handleRedirectCallback } = useAuth0();
  const auth = useAuth();




  useEffect(() => {
    EncryptionPlugin.requestAllPermissions({ permissions: ["camera", "mic"] })

    const redirectUrl = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_REDIRECT_CALLBACK ?? `${window.location.origin}/signin`

    const listener = CapApp.addListener("appUrlOpen", async ({ url }) => {
      console.log(`RECEIVED A DEEPLINK ${url}`)
      if (url.startsWith(redirectUrl)) {
        if (
          (url.includes("code") || url.includes("error"))
        ) {
          await auth.handleRedirectCallback(url)
        }

        await Browser.close();
      } else if (url.startsWith("lupyd://m.lupyd.com")) {
          const link = new URL(url)
          navigate({
            pathname: link.pathname,
            search: link.search
          })
        }
    });

    return () => {
      listener.then((_) => _.remove())
    }
  }, [handleRedirectCallback]);


  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    (async () => {
      const url = await CapApp.getLaunchUrl()
      if (!url) {
        return
      }

      if (url.url.startsWith("lupyd://m.lupyd.com")) {
        const link = new URL(url.url)
        navigate({
          pathname: link.pathname,
          search: link.search
        })
      }
    })()
  }, [])


  console.log(`App redrew`)

  return (
    <Suspense fallback={<LoadingPage />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/about/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/about/community" element={<PageTransition><CommunityPage /></PageTransition>} />
        <Route path="/about/features" element={<PageTransition><FeaturesPage /></PageTransition>} />
        <Route path="/about/experience" element={<PageTransition><ExperiencePage /></PageTransition>} />
        <Route path="/about/creator-tools" element={<PageTransition><CreatorToolsPage /></PageTransition>} />
        <Route path="/about/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><AssignUsernamePage /></PageTransition>} />
        {/*        <Route path="/signin" element={<SignupPage />} />
*/}
        <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
        {/*        <Route path="/action" element={<ActionHandler />} />
*/}

        <Route path="/saved-posts" element={<PageTransition><SavedPostsPage /></PageTransition>} />
        <Route path="/create-post" element={<PageTransition><CreatePostPage /></PageTransition>} />
        <Route path="/connections" element={<PageTransition><ConnectionsPage /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
        <Route path="/activity" element={<PageTransition><ActivityPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/groups" element={<PageTransition><GroupsPage /></PageTransition>} />
        <Route path="/groups/create" element={<PageTransition><CreateGroupPage /></PageTransition>} />
        <Route path="/groups/:groupid/settings" element={<PageTransition><GroupSettingsPage /></PageTransition>} />
        <Route path="/groups/:groupid/info" element={<PageTransition><GroupInfoPage /></PageTransition>} />
        <Route path="/groups/:groupid/channels" element={<PageTransition><GroupChannelsPage /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><SubscriptionPage /></PageTransition>} />
        <Route path="/subscription/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/discover" element={<PageTransition><DiscoverPage /></PageTransition>} />
        <Route path="/post/:postId" element={<PageTransition><PostPage /></PageTransition>} />
        <Route path="/user/:username" element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path="/notification-test" element={<PageTransition><NotificationTestPage /></PageTransition>} />
        <Route element={<FireflyProvider />}>
          <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
          <Route path="/messages/:username" element={<PageTransition><UserMessagePage /></PageTransition>} />
          <Route path="/messages/:username/call" element={<PageTransition><UserCallPage /></PageTransition>} />
        </Route>
        <Route path="/notification" element={<PageTransition><NotificationsPage /></PageTransition>} />
        <Route path="/terms-of-use" element={<PageTransition><TermsOfUse /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/business" element={<PageTransition><OverviewPage /></PageTransition>} />
        <Route path="/business/clients-page" element={<PageTransition><ClientsPage /></PageTransition>} />
        <Route path="/business/services-page" element={<PageTransition><ServicesPage /></PageTransition>} />
        <Route path="/business/add-client-page" element={<PageTransition><AddClientPage /></PageTransition>} />
        <Route path="/business/edit-client-page" element={<PageTransition><EditClientPage /></PageTransition>} />
        <Route path="/business/api-key-page" element={<PageTransition><ApiKeyPage /></PageTransition>} />
        <Route path="/business/clientdetails" element={<PageTransition><ClientDetailsPage /></PageTransition>} />
        <Route path="/business/add-service-page" element={<PageTransition><AddServicePage /></PageTransition>} />
      </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
