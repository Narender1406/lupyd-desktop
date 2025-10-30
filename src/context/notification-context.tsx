"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'

interface NotificationContextType {
  pushToken: string | null
  isPushSupported: boolean
  isLocalSupported: boolean
  initializeNotifications: () => Promise<void>
  sendLocalNotification: (title: string, body: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken] = useState<string | null>(null)
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isLocalSupported, setIsLocalSupported] = useState(false)

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    try {
      console.log('=== INITIALIZING NOTIFICATIONS ===')
      console.log('Platform:', Capacitor.getPlatform())
      console.log('Is native platform:', Capacitor.isNativePlatform())
      
      if (Capacitor.isNativePlatform()) {
        console.log('Running on native platform')
        
        // Check if push notifications are supported
        const pushSupported = Capacitor.isPluginAvailable('PushNotifications')
        setIsPushSupported(pushSupported)
        console.log('Push notifications supported:', pushSupported)
        
        // Check if local notifications are supported
        const localSupported = Capacitor.isPluginAvailable('LocalNotifications')
        setIsLocalSupported(localSupported)
        console.log('Local notifications supported:', localSupported)

        if (pushSupported) {
          console.log('Setting up push notifications...')
          
          // Add all listeners first
          PushNotifications.addListener('registration', (token) => {
            console.log('=== PUSH NOTIFICATION REGISTRATION ===')
            console.log('Push notification token received:', token.value)
            setPushToken(token.value)
          })

          PushNotifications.addListener('registrationError', (error) => {
            console.error('=== PUSH NOTIFICATION REGISTRATION ERROR ===')
            console.error('Push notification registration error:', JSON.stringify(error))
          })

          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('=== PUSH NOTIFICATION RECEIVED IN APP ===')
            console.log('Notification data:', JSON.stringify(notification))
            // Convert push notification to local notification
            sendLocalNotification(
              notification.title || 'Push Notification',
              notification.body || 'You have a new notification'
            )
          })

          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('=== PUSH NOTIFICATION ACTION PERFORMED ===')
            console.log('Push notification action performed:', JSON.stringify(notification))
          })
          
          // Request permission for push notifications
          console.log('Requesting push notification permissions...')
          const permission = await PushNotifications.requestPermissions()
          console.log('Push notification permission result:', JSON.stringify(permission))
          
          if (permission.receive === 'granted') {
            console.log('Push notification permission granted, registering...')
            await PushNotifications.register()
            console.log('Push notifications registered')
          } else {
            console.log('Push notification permission denied')
          }
        }

        if (localSupported) {
          console.log('Setting up local notifications...')
          
          // Add listeners for local notifications
          LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('=== LOCAL NOTIFICATION ACTION PERFORMED ===')
            console.log('Local notification action performed:', JSON.stringify(notification))
          })
          
          LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('=== LOCAL NOTIFICATION RECEIVED ===')
            console.log('Local notification received:', JSON.stringify(notification))
          })
          
          // Request permission for local notifications
          console.log('Requesting local notification permissions...')
          const localPermission = await LocalNotifications.requestPermissions()
          console.log('Local notification permission result:', JSON.stringify(localPermission))
          
          if (localPermission.display === 'granted') {
            console.log('Local notification permission granted')
            
            // Create a notification channel for Android
            if (Capacitor.getPlatform() === 'android') {
              try {
                console.log('Creating notification channel...')
                const result = await LocalNotifications.createChannel({
                  id: 'lupyd_notifications',
                  name: 'Lupyd Notifications',
                  description: 'Lupyd app notifications',
                  importance: 5,
                  visibility: 1,
                  sound: 'default',
                  vibration: true,
                })
                console.log('Notification channel created successfully', result)
              } catch (error) {
                console.error('Error creating notification channel:', error)
              }
            }
          } else {
            console.log('Local notification permission denied')
          }
        }
      } else {
        console.log('Not running on a native platform')
      }
      
      console.log('=== NOTIFICATION INITIALIZATION COMPLETE ===')
    } catch (error) {
      console.error('Error initializing notifications:', error)
    }
  }

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      console.log('=== SENDING LOCAL NOTIFICATION ===')
      // Add "+++" to title to verify it's a local notification
      const markedTitle = title + "+++ (direct local notification)";
      console.log('Title:', markedTitle)
      console.log('Body:', body)
      
      if (Capacitor.isNativePlatform() && isLocalSupported) {
        // Generate a unique ID for the notification
        const notificationId = new Date().getTime()
        
        console.log('Scheduling notification with ID:', notificationId)
        
        // First check if the channel exists
        if (Capacitor.getPlatform() === 'android') {
          try {
            console.log('Checking if notification channel exists...')
            // Note: Capacitor doesn't have a direct method to check if a channel exists
            // We'll just try to create it again to ensure it exists
            await LocalNotifications.createChannel({
              id: 'lupyd_notifications',
              name: 'Lupyd Notifications',
              description: 'Lupyd app notifications',
              importance: 5,
              visibility: 1,
              sound: 'default',
              vibration: true,
            })
            console.log('Notification channel ensured')
          } catch (error) {
            console.error('Error ensuring notification channel:', error)
          }
        }
        
        const notifs = await LocalNotifications.schedule({
          notifications: [
            {
              title: markedTitle,
              body: body,
              id: notificationId,
              schedule: { at: new Date(Date.now() + 2000) }, // Schedule 2 seconds in the future
              sound: 'default',
              attachments: [],
              actionTypeId: '',
              extra: null,
              channelId: 'lupyd_notifications',
            },
          ],
        })
        
        console.log('Local notification scheduled successfully')
        console.log('Scheduled notifications result:', JSON.stringify(notifs))
      } else {
        console.log('Local notifications not supported on this platform')
      }
    } catch (error) {
      console.error('Error sending local notification:', error)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        isPushSupported,
        isLocalSupported,
        initializeNotifications,
        sendLocalNotification,
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