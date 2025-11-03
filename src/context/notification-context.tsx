"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import NativeNotification from '../plugins/native-notification'

interface NotificationContextType {
  pushToken: string | null
  initializeNotifications: () => Promise<void>
  showBundledNotification: (sender: string, message: string) => Promise<void>
  showCallNotification: (caller: string, conversationId: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken] = useState<string | null>(null)

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    try {
      console.log('=== INITIALIZING NATIVE NOTIFICATIONS ===')
      console.log('Platform:', Capacitor.getPlatform())
      
      if (!Capacitor.isNativePlatform()) {
        console.log('Not running on native platform - notifications disabled')
        return
      }

      console.log('Initializing FCM via native plugin...')
      
      // Initialize native plugin and get FCM token
      const result = await NativeNotification.initialize()
      
      if (result.success && result.token) {
        console.log('✓ FCM Token received:', result.token)
        setPushToken(result.token)
      } else {
        console.error('✗ Failed to initialize FCM')
      }
      
      console.log('=== NATIVE NOTIFICATION INITIALIZATION COMPLETE ===')
    } catch (error) {
      console.error('✗ Error initializing native notifications:', error)
    }
  }

  const showBundledNotification = async (sender: string, message: string) => {
    try {
      console.log('=== SHOWING BUNDLED NOTIFICATION ===')
      console.log('Sender:', sender)
      console.log('Message:', message)
      
      const result = await NativeNotification.showBundledNotification({ sender, message })
      
      if (result.success) {
        console.log('✓ Bundled notification shown successfully')
      }
    } catch (error) {
      console.error('✗ Error showing bundled notification:', error)
    }
  }

  const showCallNotification = async (caller: string, conversationId: number) => {
    try {
      console.log('=== SHOWING CALL NOTIFICATION ===')
      console.log('Caller:', caller)
      console.log('Conversation ID:', conversationId)
      
      const result = await NativeNotification.showCallNotification({ caller, conversationId })
      
      if (result.success) {
        console.log('✓ Call notification shown successfully')
      }
    } catch (error) {
      console.error('✗ Error showing call notification:', error)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        initializeNotifications,
        showBundledNotification,
        showCallNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
