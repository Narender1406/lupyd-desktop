import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CommunityPage from './app/(landing)/community/page'
import CreatorToolsPage from './app/(landing)/creator-tools/page'
import ExperiencePage from './app/(landing)/experience/page'
import FeaturesPage from './app/(landing)/features/page'
import LandingPage from './app/(landing)/page'
import PrivacyPage from './app/(landing)/privacy/page'

import ActivityPage from './app/dashboard/activity/page'
import AnalyticsPage from './app/dashboard/analytics/page'
import ConnectionsPage from './app/dashboard/connections/page'
import CreatePostPage from './app/dashboard/create-post/page'
import DiscoverPage from './app/dashboard/discover/page'

import MessagesPage from './app/dashboard/messages/page'
import DashboardPage from './app/dashboard/page'



import PostPage from './app/dashboard/post/[postId]/page'
import SavedPostsPage from './app/dashboard/saved-posts/page'
import SettingsPage from './app/dashboard/settings/page'
import ProfilePage from './app/dashboard/user/[username]/page'
import SubscriptionPage from './app/dashboard/subscription/page'
import CheckoutPage from './app/dashboard/subscription/checkout/page'
import NotificationsPage from './app/dashboard/notification/notifications-page'
import AssignUsernamePage from './app/assignUsername'

import { ClientsPage } from './app/saas/pages/clients-page'
import { ServicesPage } from './app/saas/pages/services-page'
import { AddClientPage } from './app/saas/pages/add-client-page'
import { EditClientPage } from './app/saas/pages/editclient'
import { ApiKeyPage } from './app/saas/pages/api-key-page'
import { ClientDetailsPage } from './app/saas/pages/clientdetails'
import { AddServicePage } from './app/saas/pages/add-service-page'

import { OverviewPage } from './app/saas/pages/overview-page'
import { lazy, Suspense } from 'react'


function App() {
  return (
    <BrowserRouter>
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
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscription/checkout" element={<CheckoutPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notification" element={<NotificationsPage />} />

        {/*        <Route path="/business" element={<OverviewPage />} />
        <Route path="/business/clients-page" element={<ClientsPage />} />
        <Route path="/business/services-page" element={<ServicesPage />} />
        <Route path="/business/add-client-page" element={<AddClientPage />} />
        <Route path="/business/edit-client-page" element={<EditClientPage />} />
        <Route path="/business/api-key-page" element={<ApiKeyPage />} />
        <Route path="/business/clientdetails" element={<ClientDetailsPage />} />
        <Route path="/business/add-service-page" element={<AddServicePage />} />

*/}        {/*<Route path="/dashboard/messages/:username" element={<UserMessagePage />} />*/}
      </Routes>
    </BrowserRouter>)
}

export default App
