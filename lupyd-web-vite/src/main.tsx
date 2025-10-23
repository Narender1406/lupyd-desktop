// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { UserDataProvider } from "@/context/userdata-context"
// import { SnackbarProvider } from "@/components/snackbar"
import { DialogProvider } from "@/context/dialog-context"
import { UserImageProvider } from "@/context/user-image-context"
import { App as CapacitorApp } from '@capacitor/app';

// Handle Android back button
CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    CapacitorApp.exitApp();
  }
});

createRoot(document.getElementById('root')!).render(

  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <DialogProvider>
        <AuthProvider>
          <UserImageProvider>
            <UserDataProvider>
              <div className="flex min-h-screen flex-col">
                <App />
              </div>
            </UserDataProvider>
          </UserImageProvider>
        </AuthProvider>
    </DialogProvider>
  </ThemeProvider>


)
