import './App.css'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { useAuth0 } from '@auth0/auth0-react';
import { NotificationProvider } from './context/notification-context';





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


const FireflyProvider = lazy(() => import("./context/firefly-context"));
const ActivityPage = lazy(() => import('./app/dashboard/activity/page'));
const AnalyticsPage = lazy(() => import('./app/dashboard/analytics/page'));
const ConnectionsPage = lazy(() => import('./app/dashboard/connections/page'));
const CreatePostPage = lazy(() => import('./app/dashboard/create-post/page'));
const DiscoverPage = lazy(() => import('./app/dashboard/discover/page'));
const MessagesPage = lazy(() => import('./app/dashboard/messages/page'));
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



function LoadingPage() {
  return <div></div>
}


function App() {


  const { handleRedirectCallback } = useAuth0();

  useEffect(() => {

    const redirectUrl = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_REDIRECT_CALLBACK ?? `${window.location.origin}/signin`

    CapApp.addListener("appUrlOpen", async ({ url }) => {
      console.log(`RECEIVED A DEEPLINK ${url}`)
      if (url.startsWith(redirectUrl)) {
        if (
          url.includes("state") &&
          (url.includes("code") || url.includes("error"))
        ) {
          await handleRedirectCallback(url);
        }

        await Browser.close();
      }
    });
  }, [handleRedirectCallback]);




  return (
    <NotificationProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/about/" element={<LandingPage />} />
            <Route path="/about/community" element={<CommunityPage />} />
            <Route path="/about/features" element={<FeaturesPage />} />
            <Route path="/about/experience" element={<ExperiencePage />} />
            <Route path="/about/creator-tools" element={<CreatorToolsPage />} />
            <Route path="/about/privacy" element={<PrivacyPage />} />
            <Route path="/signin" element={<AssignUsernamePage />} />
            {/*        <Route path="/signin" element={<SignupPage />} />
*/}
            <Route path="/" element={<DashboardPage />} />
            {/*        <Route path="/action" element={<ActionHandler />} />
*/}

            <Route path="/saved-posts" element={<SavedPostsPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/create" element={<CreateGroupPage />} />
            <Route path="/groups/:groupid/settings" element={<GroupSettingsPage />} />
            <Route path="/groups/:groupid/info" element={<GroupInfoPage />} />
            <Route path="/groups/:groupid/channels" element={<GroupChannelsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/checkout" element={<CheckoutPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/post/:postId" element={<PostPage />} />
            <Route path="/user/:username" element={<ProfilePage />} />
            <Route path="/notification-test" element={<NotificationTestPage />} />
            <Route element={<FireflyProvider />}>
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:username" element={<UserMessagePage />} /> </Route>
            <Route path="/notification" element={<NotificationsPage />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/business" element={<OverviewPage />} />
            <Route path="/business/clients-page" element={<ClientsPage />} />
            <Route path="/business/services-page" element={<ServicesPage />} />
            <Route path="/business/add-client-page" element={<AddClientPage />} />
            <Route path="/business/edit-client-page" element={<EditClientPage />} />
            <Route path="/business/api-key-page" element={<ApiKeyPage />} />
            <Route path="/business/clientdetails" element={<ClientDetailsPage />} />
            <Route path="/business/add-service-page" element={<AddServicePage />} />
          </Routes>

        </Suspense>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App