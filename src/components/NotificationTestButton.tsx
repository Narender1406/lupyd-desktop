// import React, { useEffect } from 'react';
// import { useNotification } from '@/context/notification-context';
// import type { ToastProps } from '@/components/ui/toast';
// import { Capacitor } from '@capacitor/core';

// interface NotificationTestButtonProps {
//   toast: (props: { title?: React.ReactNode; description?: React.ReactNode } & ToastProps) => void;
// }

// const NotificationTestButton: React.FC<NotificationTestButtonProps> = ({ toast }) => {
//   const { pushToken, isPushSupported, isLocalSupported, sendLocalNotification } = useNotification();

//   // Log token when it's available
//   useEffect(() => {
//     if (pushToken) {
//       console.log('=== PUSH TOKEN AVAILABLE ===')
//       console.log('Push token:', pushToken)
//     }
//   }, [pushToken]);

//   const handleSendLocalNotification = async () => {
//     try {
//       console.log('=== USER CLICKED SEND LOCAL NOTIFICATION ===')
//       await sendLocalNotification("Test Local Notification", "This is a test local notification from Lupyd app. Check your notification tray!")
//       toast({
//         title: "Local Notification Sent",
//         description: "Check your device's notification tray in 2 seconds",
//       })
//     } catch (error) {
//       console.error('Error sending local notification:', error)
//       toast({
//         title: "Error",
//         description: "Failed to send local notification: " + (error as Error).message,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleCopyToken = () => {
//     if (pushToken) {
//       navigator.clipboard.writeText(pushToken)
//       toast({
//         title: "Token Copied",
//         description: "Push notification token copied to clipboard",
//       })
//     }
//   }

//   if (!isPushSupported && !isLocalSupported) {
//     return (
//       <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
//         <h3 className="text-lg font-semibold mb-2">Notification Test</h3>
//         <p className="text-sm text-gray-600 dark:text-gray-300">
//           Notifications are not supported on this platform.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
//       <h3 className="text-lg font-semibold mb-2">Notification Test</h3>
      
//       <div className="mb-4">
//         <p className="text-sm text-gray-600 dark:text-gray-300">
//           Platform: {Capacitor.getPlatform()}
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-300">
//           Push Notifications: {isPushSupported ? 'Supported' : 'Not Supported'}
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-300">
//           Local Notifications: {isLocalSupported ? 'Supported' : 'Not Supported'}
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
//           Push Token: {pushToken ? `${pushToken.substring(0, 20)}...` : 'Not available'}
//         </p>
//         {pushToken && (
//           <button
//             onClick={handleCopyToken}
//             className="mt-1 text-xs text-blue-600 hover:underline"
//           >
//             Copy Token
//           </button>
//         )}
//       </div>
      
//       <div className="space-y-2">
//         <button
//           onClick={handleSendLocalNotification}
//           disabled={!isLocalSupported}
//           className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//             isLocalSupported
//               ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
//               : "bg-gray-300 text-gray-500 cursor-not-allowed"
//           }`}
//         >
//           {isLocalSupported ? "Send Test Local Notification" : "Local Notifications Not Supported"}
//         </button>
//       </div>
      
//       <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
//         <p className="font-medium">Debug Information:</p>
//         <ul className="list-disc pl-5 mt-1 space-y-1">
//           <li>Check browser console for detailed logs</li>
//           <li>Local notifications appear in 2 seconds</li>
//           <li>Push notifications convert to local notifications</li>
//           <li>Token needed for Firebase Console testing</li>
//         </ul>
//         <p className="mt-2 font-medium">Testing Instructions:</p>
//         <ol className="list-decimal pl-5 mt-1 space-y-1">
//           <li>Copy the push token above</li>
//           <li>Go to Firebase Console &gt; Cloud Messaging</li>
//           <li>Create a new notification with the token</li>
//           <li>Send and check your device</li>
//         </ol>
//       </div>
//     </div>
//   )
// }

// export default NotificationTestButton
