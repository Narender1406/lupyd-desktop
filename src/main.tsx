// import { StrictMode } from 'react'
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, LupydAuth0Provider } from "@/context/auth-context"
import { UserDataProvider } from "@/context/userdata-context"
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { SnackbarProvider } from "@/components/snackbar"
import { DialogProvider } from "@/context/dialog-context"
import { UserImageProvider } from "@/context/user-image-context"
import { App as CapacitorApp } from '@capacitor/app'

// Handle Android back button
CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    CapacitorApp.exitApp();
  }
});

// Configure status bar to be visible and styled appropriately
const configureStatusBar = async () => {
  try {
    // Check if we're on a native platform
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      // Import StatusBar plugin dynamically
      const { StatusBar, Style } = await import('@capacitor/status-bar');

      // Set status bar style to light content (white text/icons)
      await StatusBar.setStyle({ style: Style.Light });

      // Set status bar background color to match app theme
      await StatusBar.setBackgroundColor({ color: '#000000' }); // Black background

      // Show status bar (in case it was hidden)
      await StatusBar.show();

      console.log('Status bar configured successfully');
    }
  } catch (error) {
    console.error('Failed to configure status bar:', error);
  }
};

// Configure status bar on app start
configureStatusBar();

import { ApiServiceProvider } from "@/context/apiService"
import { PersistenceProvider } from "@/context/persistence-provider"
import { QueryClientProviderWrapper } from "@/context/query-client"
import FireflyProvider from './context/firefly-context.tsx'
import { BrowserRouter } from "react-router-dom"


createRoot(document.getElementById('root')!).render(

  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProviderWrapper>
      <PersistenceProvider>
        <DialogProvider>
          <LupydAuth0Provider>
            <BrowserRouter>
              <AuthProvider>
                <ApiServiceProvider>
                  <UserImageProvider>
                    <UserDataProvider>
                      <FireflyProvider>
                        <div className="flex min-h-screen flex-col">
                          <App />
                        </div>
                      </FireflyProvider>
                    </UserDataProvider>
                  </UserImageProvider>
                </ApiServiceProvider>
              </AuthProvider>
            </BrowserRouter>
          </LupydAuth0Provider>
        </DialogProvider>
      </PersistenceProvider>
    </QueryClientProviderWrapper>
  </ThemeProvider>


)
