"use client"
import { useAuth } from "@/context/auth-context"
import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getAuthHandler } from "lupyd-js"
import { useSnackbar } from "@/components/snackbar"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const auth = useAuth()
  const snackbar =useSnackbar()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <span className="text-xl font-bold">Lupyd</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link to="/features" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Features
            </Link>
            <Link to="/experience" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Experience
            </Link>
            <Link to="/community" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Community
            </Link>
            <Link to="/privacy" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Privacy
            </Link>
            <Link to="/dashboard/subscription" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Subscriptions
            </Link>
            <Link to="/creator-tools" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Creator Tools
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200"
              >
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>

            {/*
            <Link to="/login" className="text-sm font-medium hover:underline">
              Log In
            </Link>
            */}
            {auth.isAuthenticated ? (
              <div></div>
            ) : (
              <Button
                onClick={() => {
                  if (auth.username) {
                    navigate("/dashboard")
                  } else {
                    if (auth.user && !auth.username) {
                      navigate("/assignUsername")
                    } else {
                      getAuthHandler()?.login().then(() => {
                        navigate("/assignUsername")
                      }).catch(err => {
                        console.error(err)
                        snackbar("Something went wrong")
                      })
                    }
                  }
                }}
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-gray-800"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50 md:hidden">
              <div className="container py-4">
                {/* Navigation Links */}
                <div className="flex flex-col space-y-4 mb-6">
                  <Link
                    to="/features"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    to="/experience"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Experience
                  </Link>
                  <Link
                    to="/community"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Community
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/creator-tools"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Creator Tools
                  </Link>
                </div>

                {/* Auth Button for Mobile */}
                {!auth.isAuthenticated && (
                  <div className="pt-4 border-t">
                    <Link
                      to="/signin"
                      className="inline-flex w-full h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Link to="/">
                <span className="text-xl font-bold">Lupyd</span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              The next generation social platform for connecting, sharing, and collaborating.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/community" className="text-muted-foreground hover:text-foreground">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-between gap-4 border-t py-6 md:h-16 md:flex-row md:py-0">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Lupyd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Instagram</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Facebook</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
