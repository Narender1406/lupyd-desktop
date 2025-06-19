import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './app/(landing)/page'
import DashboardPage from './app/dashboard/page'
import SignupPage from './app/(landing)/signin/page'
import PostPage from './app/dashboard/post/[postId]/page'
import ProfilePage from './app/dashboard/user/[username]/page'
import MessagesPage from './app/dashboard/messages/page'
import SettingsPage from './app/dashboard/settings/page'
import DiscoverPage from './app/dashboard/discover/page'
import CommunityPage from './app/(landing)/community/page'
import CreatePostPage from './app/dashboard/create-post/page'
import ConnectionsPage from './app/dashboard/connections/page'
import AnalyticsPage from './app/dashboard/analytics/page'
import SavedPostsPage from './app/dashboard/saved-posts/page'
import PrivacyPage from './app/(landing)/privacy/page'
import FeaturesPage from './app/(landing)/features/page'
import CreatorToolsPage from './app/(landing)/creator-tools/page'
import ExperiencePage from './app/(landing)/experience/page'
import LandingLayout from './app/(landing)/layout'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
        <Route path="/community" element={<LandingLayout><CommunityPage /></LandingLayout>} />
        <Route path="/features" element={<LandingLayout> <FeaturesPage /> </LandingLayout>} />
        <Route path="/experience" element={<LandingLayout><ExperiencePage /> </LandingLayout>} />
        <Route path="/creator-tools" element={<LandingLayout> <CreatorToolsPage /></LandingLayout>} />
        <Route path="/privacy" element={<LandingLayout><PrivacyPage /></LandingLayout>} />
        <Route path="/signin" element={<LandingLayout><SignupPage /></LandingLayout>} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/saved-posts" element={<SavedPostsPage />} />
        <Route path="/dashboard/create-post" element={<CreatePostPage />} />
        <Route path="/dashboard/connections" element={<ConnectionsPage />} />
        <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/discover" element={<DiscoverPage />} />
        <Route path="/dashboard/post/:postId" element={<PostPage />} />
        <Route path="/dashboard/user/:username" element={<ProfilePage />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
        <Route path="/dashboard/messages/:username" element={<MessagesPage />} />
      </Routes>
    </BrowserRouter>)
}

export default App
