"use client"
import type React from "react"
import { Link } from "react-router-dom"
import { useState } from "react"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/about">
              <span className="text-xl font-bold">Lupyd</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link to="/about/features" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Features
            </Link>
            <Link to="/about/experience" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Experience
            </Link>
            <Link to="/about/community" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Community
            </Link>
            <Link to="/about/privacy" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Privacy
            </Link>
            <Link to="/about/subscription" className="text-sm font-medium hover:text-gray-500 transition-colors">
              Subscriptions
            </Link>
            <Link to="/about/creator-tools" className="text-sm font-medium hover:text-gray-500 transition-colors">
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
                    to="/about/features"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    to="/about/experience"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Experience
                  </Link>
                  <Link
                    to="/about/community"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Community
                  </Link>
                  <Link
                    to="/about/privacy"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/about/creator-tools"
                    className="text-sm font-medium py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Creator Tools
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
      <main className="flex-1" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>{children}</main>
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
                  <Link to="about/features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about/community" className="text-muted-foreground hover:text-foreground">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-between gap-4 border-t py-6 md:h-16 md:flex-row md:py-0">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Lupyd. All rights reserved.</p>
          <div className="flex gap-4">
          </div>
        </div>
      </footer>
    </div>
  )
}
