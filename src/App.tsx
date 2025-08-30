import './App.css'

import { lazy, Suspense } from 'react'


import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { OverviewPage } from './app/saas/pages/overview-page';
// import CommunityPage from './app/(landing)/community/page'
// import CreatorToolsPage from './app/(landing)/creator-tools/page'
// import ExperiencePage from './app/(landing)/experience/page'
// import FeaturesPage from './app/(landing)/features/page'
// import LandingPage from './app/(landing)/page'
// import PrivacyPage from './app/(landing)/privacy/page'

// import ActivityPage from './app/dashboard/activity/page'
// import AnalyticsPage from './app/dashboard/analytics/page'
// import ConnectionsPage from './app/dashboard/connections/page'
// import CreatePostPage from './app/dashboard/create-post/page'
// import DiscoverPage from './app/dashboard/discover/page'

// import MessagesPage from './app/dashboard/messages/page'
// import DashboardPage from './app/dashboard/page'

// import PostPage from './app/dashboard/post/[postId]/page'
// import SavedPostsPage from './app/dashboard/saved-posts/page'
// import SettingsPage from './app/dashboard/settings/page'
// import ProfilePage from './app/dashboard/user/[username]/page'
// import SubscriptionPage from './app/dashboard/subscription/page'
// import CheckoutPage from './app/dashboard/subscription/checkout/page'
// import NotificationsPage from './app/dashboard/notification/notifications-page'
// import AssignUsernamePage from './app/assignUsername'

// import { ClientsPage } from './app/saas/pages/clients-page'
// import { ServicesPage } from './app/saas/pages/services-page'
// import { AddClientPage } from './app/saas/pages/add-client-page'
// import { EditClientPage } from './app/saas/pages/editclient'
// import { ApiKeyPage } from './app/saas/pages/api-key-page'
// import { ClientDetailsPage } from './app/saas/pages/clientdetails'
// import { AddServicePage } from './app/saas/pages/add-service-page'

// import { OverviewPage } from './app/saas/pages/overview-page'
// import { AnalyticssaasPage } from './app/saas/pages/analytics-saas-page'
// import { MonitoringPage } from './app/saas/pages/monitoring-page'
// import { BillingPage } from './app/saas/pages/billing-page'
// import { SupportPage } from './app/saas/pages/support-page'
// import GroupsPage from './app/dashboard/groupchat/groupchat'
// import CreateGroupPage from './app/dashboard/groupchat/creategroup/creategroupchat'
// import GroupSettingsPage from './app/dashboard/groupchat/groupchatsettings/groupchatsettings'
// import GroupInfoPage from './app/dashboard/groupchat/groupinfopage/groupinfo'
// import UserMessagePage from './app/dashboard/messages/[username]/page'
// import { FireflyProvider } from './context/firefly-context'




// const ClientsPage = lazy(() => import('./app/saas/pages/clients-page').then(m => ({ default: m.ClientsPage })));
// const ServicesPage = lazy(() => import('./app/saas/pages/services-page').then(m => ({ default: m.ServicesPage })));
// const AddClientPage = lazy(() => import('./app/saas/pages/add-client-page').then(m => ({ default: m.AddClientPage })));
// const EditClientPage = lazy(() => import('./app/saas/pages/editclient').then(m => ({ default: m.EditClientPage })));
// const ApiKeyPage = lazy(() => import('./app/saas/pages/api-key-page').then(m => ({ default: m.ApiKeyPage })));
// const ClientDetailsPage = lazy(() => import('./app/saas/pages/clientdetails').then(m => ({ default: m.ClientDetailsPage })));
// const AddServicePage = lazy(() => import('./app/saas/pages/add-service-page').then(m => ({ default: m.AddServicePage })));
// const OverviewPage = lazy(() => import('./app/saas/pages/overview-page').then(m => ({ default: m.OverviewPage })));
// const MonitoringPage = lazy(() => import('./app/saas/pages/monitoring-page').then(m => ({ default: m.MonitoringPage })));
// const BillingPage = lazy(() => import('./app/saas/pages/billing-page').then(m => ({ default: m.BillingPage })));
// const SupportPage = lazy(() => import('./app/saas/pages/support-page').then(m => ({ default: m.SupportPage })));



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


const CommunityPage  = lazy(() => import('./app/(landing)/community/page'));
const CreatorToolsPage  = lazy(() => import('./app/(landing)/creator-tools/page'));
const ExperiencePage  = lazy(() => import('./app/(landing)/experience/page'));
const FeaturesPage  = lazy(() => import('./app/(landing)/features/page'));
const LandingPage  = lazy(() => import('./app/(landing)/page'));
const PrivacyPage  = lazy(() => import('./app/(landing)/privacy/page'));



const GroupsPage  = lazy(() => import('./app/dashboard/groupchat/groupchat'))
const CreateGroupPage  = lazy(() => import('./app/dashboard/groupchat/creategroup/creategroupchat'))
const GroupSettingsPage  = lazy(() => import('./app/dashboard/groupchat/groupchatsettings/groupchatsettings'))
const GroupInfoPage  = lazy(() => import('./app/dashboard/groupchat/groupinfopage/groupinfo'))
const UserMessagePage  = lazy(() => import('./app/dashboard/messages/[username]/page'))



function LoadingPage() {
  return <div></div>
}


function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage/>}>
      <Routes>
        <Route path="about/" element={<LandingPage />} />
        <Route path="about/community" element={<CommunityPage />} />
        <Route path="about/features" element={<FeaturesPage />} />
        <Route path="about/experience" element={<ExperiencePage />} />
        <Route path="about/creator-tools" element={<CreatorToolsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
        <Route path="/groupchat" element={<GroupsPage />} />
        <Route path="/groupchat/creategroupchat" element={<CreateGroupPage />} />
        <Route path="/groupchat/groupchatsettings" element={<GroupSettingsPage />} />
        <Route path="/groupchat/groupinfo" element={<GroupInfoPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscription/checkout" element={<CheckoutPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route element={<FireflyProvider />}>
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:username" element={<UserMessagePage />} />
        </Route>
        <Route path="/notification" element={<NotificationsPage />} />

        <Route path="/business" element={<OverviewPage />} />
        {/* 
=======

        <Route path="/business" element={<OverviewPage />} />
>>>>>>> 575634bf011d899830078228c675e5b3879e19e2
        <Route path="/business/clients-page" element={<ClientsPage />} />
        <Route path="/business/services-page" element={<ServicesPage />} />
        <Route path="/business/add-client-page" element={<AddClientPage />} />
        <Route path="/business/edit-client-page" element={<EditClientPage />} />
        <Route path="/business/api-key-page" element={<ApiKeyPage />} />
        <Route path="/business/clientdetails" element={<ClientDetailsPage />} />
        <Route path="/business/add-service-page" element={<AddServicePage />} />

*/}
      </Routes>

</Suspense>    
    </BrowserRouter>)
}

export default App
