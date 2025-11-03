"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationTestPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notification Testing</h1>
          <p className="text-muted-foreground">
            Test push notifications and local notifications
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Notification Test</CardTitle>
              <CardDescription>
                Test both push notifications and local notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h3 className="font-medium mb-2">How to Test Push Notifications</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Copy the push notification token displayed above</li>
                    <li>Go to the Firebase Console</li>
                    <li>Navigate to Cloud Messaging</li>
                    <li>Create a new notification</li>
                    <li>Use the token as the target device</li>
                    <li>Send the notification and check your device</li>
                  </ol>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h3 className="font-medium mb-2">Console Logs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Check the browser console for detailed logs of:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Push notification token registration</li>
                    <li>Push notifications received in foreground</li>
                    <li>Local notification scheduling</li>
                    <li>Notification action performed events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
