"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  onClick?: (e: React.MouseEvent) => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  isMobileMenuOpen?: boolean
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(items[0].name)

  // Sync activeTab with current route
  useEffect(() => {
    const current = items.find(item => item.url === location.pathname)
    if (current) {
      setActiveTab(current.name)
    }
  }, [location.pathname, items])

  useEffect(() => {
    const handleResize = () => {
      // Handle resize if needed
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border px-4",
        className,
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)', paddingTop: '4px' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto bg-background pb-1" style={{ transform: 'scale(0.85)', transformOrigin: 'bottom' }}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e)
                }
                setActiveTab(item.name)
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 relative",
                "text-foreground/80 hover:text-primary",
                isActive && "text-primary",
              )}
            >
              <Icon size={24} strokeWidth={2} /> {/* Increased icon size from 22 to 24 */}
              <span className="text-[10px] mt-1">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}