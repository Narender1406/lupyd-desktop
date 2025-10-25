import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { OverviewPage } from './app/saas/pages/overview-page';










// import TermsOfUse from './components/TermsOfUse';
// import PrivacyPolicy from "./components/PrivacyPolicy";


const TermsOfUse  = lazy(() => import('./components/TermsOfUse'));
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
        <Route path="/messages/:username" element={<UserMessagePage />} /> </Route>
        <Route path="/notification" element={<NotificationsPage />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/*
        <Route path="/business" element={<OverviewPage />} />
        <Route path="/business" element={<OverviewPage />} />
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
