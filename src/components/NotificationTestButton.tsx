import React, { useEffect } from 'react';
import { useNotification } from '@/context/notification-context';
import type { ToastProps } from '@/components/ui/toast';
import { Capacitor } from '@capacitor/core';

interface NotificationTestButtonProps {
  toast: (props: { title?: React.ReactNode; description?: React.ReactNode } & ToastProps) => void;
}

const NotificationTestButton: React.FC<NotificationTestButtonProps> = ({ toast }) => {
  const { showBundledNotification, showCallNotification } = useNotification();

  // Log token when it's available
  // useEffect(() => {
  //   if (pushToken) {
  //     console.log('=== PUSH TOKEN AVAILABLE ===')
  //     console.log('Push token:', pushToken)
  //   }
  // }, [pushToken]);

  const handleSendTestMessage = async () => {
    try {
      console.log('=== USER CLICKED SEND TEST MESSAGE ===')
      await showBundledNotification("Alice", "Hey! How are you doing?")
      toast({
        title: "Test Message Sent",
        description: "Check your notification tray",
      })
    } catch (error) {
      console.error('Error sending test message:', error)
      toast({
        title: "Error",
        description: "Failed to send message: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleSendBundledMessages = async () => {
    try {
      console.log('=== SENDING BUNDLED MESSAGES ===')
      await showBundledNotification("Bob", "First message")
      setTimeout(() => showBundledNotification("Bob", "Second message"), 1000)
      setTimeout(() => showBundledNotification("Bob", "Third message"), 2000)
      toast({
        title: "Bundled Messages Sent",
        description: "3 messages from Bob - expand to see all",
      })
    } catch (error) {
      console.error('Error sending bundled messages:', error)
      toast({
        title: "Error",
        description: "Failed: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleSendCall = async () => {
    try {
      console.log('=== SENDING CALL NOTIFICATION ===')
      await showCallNotification("John Doe", 12345)
      toast({
        title: "Call Notification Sent",
        description: "Check for incoming call",
      })
    } catch (error) {
      console.error('Error sending call:', error)
      toast({
        title: "Error",
        description: "Failed: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleCopyToken = () => {
    // if (pushToken) {
    //   navigator.clipboard.writeText(pushToken)
    //   toast({
    //     title: "Token Copied",
    //     description: "Push notification token copied to clipboard",
    //   })
    // }
  }

  // if (!pushToken) {
  //   return (
  //     <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
  //       <h3 className="text-lg font-semibold mb-2">Native Notification Test</h3>
  //       <p className="text-sm text-gray-600 dark:text-gray-300">
  //         Initializing notifications...
  //       </p>
  //     </div>
  //   )
  // }

  return (
    <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
      {/*  <h3 className="text-lg font-semibold mb-2">Native Notification Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Platform: {Capacitor.getPlatform()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          FCM Token: {pushToken ? `${pushToken.substring(0, 20)}...` : 'Not available'}
        </p>
        {pushToken && (
          <button
            onClick={handleCopyToken}
            className="mt-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            📋 Copy Token
          </button>
        )}
      </div>
*/}
      < div className="space-y-2" >
        <button
          onClick={handleSendTestMessage}
          className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        >
          Send Test Message
        </button>

        <button
          onClick={handleSendBundledMessages}
          className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
        >
          Send 3 Bundled Messages
        </button>

        <button
          onClick={handleSendCall}
          className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
        >
          Send Call Notification
        </button>
      </div >

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium">✅ Features:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Single notification per sender</li>
          <li>All messages visible when expanded</li>
          <li>Reply button (inline text input)</li>
          <li>Call notifications with Accept/Decline</li>
          <li>100% native Android - no Capacitor plugins</li>
        </ul>
        <p className="mt-2 font-medium">📱 How to Test:</p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Tap "Send 3 Bundled Messages"</li>
          <li>Expand notification to see all 3 messages</li>
          <li>Long-press to reply inline</li>
          <li>Copy token above for FCM Console testing</li>
        </ol>
      </div>
    </div >
  )
}

export default NotificationTestButton
