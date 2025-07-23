import './App.css';

import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

import ActionHandler from './app/(landing)/action/page';
import CommunityPage from './app/(landing)/community/page';
import CreatorToolsPage from './app/(landing)/creator-tools/page';
import ExperiencePage from './app/(landing)/experience/page';
import FeaturesPage from './app/(landing)/features/page';
import LandingPage from './app/(landing)/page';
import PrivacyPage from './app/(landing)/privacy/page';
import SignupPage from './app/(landing)/signin/page';
import ActivityPage from './app/dashboard/activity/page';
import AnalyticsPage from './app/dashboard/analytics/page';
import ConnectionsPage from './app/dashboard/connections/page';
import CreatePostPage from './app/dashboard/create-post/page';
import DiscoverPage from './app/dashboard/discover/page';
import UserMessagePage from './app/dashboard/messages/[username]/page';
import MessagesPage from './app/dashboard/messages/page';
import DashboardPage from './app/dashboard/page';
import PostPage from './app/dashboard/post/[postId]/page';
import SavedPostsPage from './app/dashboard/saved-posts/page';
import SettingsPage from './app/dashboard/settings/page';
import ProfilePage from './app/dashboard/user/[username]/page';
import SubscriptionPage from './app/dashboard/subscription/page';
import CheckoutPage from './app/dashboard/subscription/checkout/page';
import NotificationsPage from './app/dashboard/notification/notifications-page';
import AssignUsernamePage from './app/assignUsername';
import SaasPage from './app/saas/page';
import { ClientsPage } from './app/saas/pages/clients-page';
import { ServicesPage } from './app/saas/pages/services-page';
import { AddClientPage } from './app/saas/pages/add-client-page';
import { EditClientPage } from './app/saas/pages/editclient';
import { ApiKeyPage } from './app/saas/pages/api-key-page';
import { ClientDetailsPage } from './app/saas/pages/clientdetails';
import { AddServicePage } from './app/saas/pages/add-service-page';
import { AppSidebar } from './app/saas/layout/app-sidebar';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = CapacitorApp.addListener('backButton', () => {
      if (location.pathname === '/' || location.pathname === '/home') {
        // if already at home
        CapacitorApp.exitApp();
      } else {
        // otherwise navigate back
        navigate(-1);
      }
    });

    return () => {
      handler.remove();
    };
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/experience" element={<ExperiencePage />} />
      <Route path="/creator-tools" element={<CreatorToolsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/assignUsername" element={<AssignUsernamePage />} />
      <Route path="/saas" element={<SaasPage />} />
      <Route path="/signin" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/action" element={<ActionHandler />} />
      <Route path="/dashboard/saved-posts" element={<SavedPostsPage />} />
      <Route path="/dashboard/create-post" element={<CreatePostPage />} />
      <Route path="/dashboard/connections" element={<ConnectionsPage />} />
      <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
      <Route path="/dashboard/activity" element={<ActivityPage />} />
      <Route path="/dashboard/settings" element={<SettingsPage />} />
      <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
      <Route path="/dashboard/subscription/checkout" element={<CheckoutPage />} />
      <Route path="/dashboard/discover" element={<DiscoverPage />} />
      <Route path="/dashboard/post/:postId" element={<PostPage />} />
      <Route path="/dashboard/user/:username" element={<ProfilePage />} />
      <Route path="/dashboard/messages" element={<MessagesPage />} />
      <Route path="/dashboard/messages/:username" element={<UserMessagePage />} />
      <Route path="/dashboard/notification" element={<NotificationsPage />} />
      <Route path="/saas/pages/clients-page" element={<ClientsPage />} />
      <Route path="/saas/pages/services-page" element={<ServicesPage />} />
      <Route path="/saas/pages/add-client-page" element={<AddClientPage />} />
      <Route path="/saas/pages/edit-client-page" element={<EditClientPage />} />
      <Route path="/saas/pages/api-key-page" element={<ApiKeyPage />} />
      <Route path="/saas/pages/clientdetails" element={<ClientDetailsPage />} />
      <Route path="/saas/pages/add-service-page" element={<AddServicePage />} />
      <Route path="/saas/layout/app-sidebar" element={<AppSidebar />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
export { AppRoutes }; // Export AppRoutes for potential use in other components or tests