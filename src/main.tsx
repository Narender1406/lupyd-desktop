// import { StrictMode } from 'react'
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, LupydAuth0Provider } from "@/context/auth-context"
import { UserDataProvider } from "@/context/userdata-context"
import { SavedPostsDataProvider } from "@/context/saved-posts"
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

// No status bar configuration - letting native theme control it completely
// All JS calls removed as per instructions

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
                      <SavedPostsDataProvider>
                      <FireflyProvider>
                        <div>
                          <App />
                        </div>
                      </FireflyProvider>
                      </SavedPostsDataProvider>
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