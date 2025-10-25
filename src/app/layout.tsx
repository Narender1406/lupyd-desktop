import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { UserDataProvider } from "@/context/userdata-context"
import { DialogProvider } from "@/context/dialog-context"
import { UserImageProvider } from "@/context/user-image-context"

export const metadata = {
  title: "Lupyd - The Next Generation Social Platform",
  description:
    "Experience the future of social networking with Lupyd. Connect, share, and collaborate in a secure and personalized environment.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <DialogProvider>
              <AuthProvider>
                <UserImageProvider>
                  <UserDataProvider>
                    <div className="flex min-h-screen flex-col">
                      {children}
                    </div>
                  </UserDataProvider>
                </UserImageProvider>
              </AuthProvider>
          </DialogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
