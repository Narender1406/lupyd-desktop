"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

import { AnimatedCard } from "@/components/animated-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Bell,
  Calendar,
  Clock,
  MessageCircle,
  Share2,
  ThumbsUp,
  UserPlus,
} from "lucide-react"


// Mock activity data
const activities = [
  {
    id: "activity1",
    type: "like",
    user: { id: "user1", name: "Sarah Johnson", avatar: "", avatarFallback: "SJ" },
    content: "liked your post",
    target: '"Just finished my latest UI design project"',
    timestamp: "10 minutes ago",
  },
  {
    id: "activity2",
    type: "comment",
    user: { id: "user2", name: "Alex Chen", avatar: "", avatarFallback: "AC" },
    content: "commented on your post",
    target: '"This looks amazing! I love the color palette you chose."',
    timestamp: "1 hour ago",
  },
  {
    id: "activity3",
    type: "follow",
    user: { id: "user3", name: "Emily Wong", avatar: "", avatarFallback: "EW" },
    content: "started following you",
    timestamp: "3 hours ago",
  },
]

const reminders = [
  { id: "r1", title: "Design Team Meeting", date: "Today", time: "2:00 PM" },
  { id: "r2", title: "UI Mockups Deadline", date: "Tomorrow", time: "5:00 PM" },
  { id: "r3", title: "Client Call", date: "May 15", time: "11:00 AM" },
]

export default function ActivityPage() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-4 w-4" />
      case "comment":
        return <MessageCircle className="h-4 w-4" />
      case "follow":
        return <UserPlus className="h-4 w-4" />
      case "mention":
        return <Bell className="h-4 w-4" />
      case "share":
        return <Share2 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout >
      <div className="max-w-4xl mx-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your interactions and stay updated on your network
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
            {["all", "mentions", "comments", "likes"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white py-2 px-4"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ALL TAB */}
          <TabsContent value="all" className="mt-0 space-y-6">
            <AnimatedCard>
              <Card className="border-none shadow-sm bg-white dark:bg-black">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <AnimatedCard key={activity.id} delay={0.05 * index}>
                        <div className="flex items-start space-x-4 py-2">
                          <Avatar>
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.avatarFallback}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p>
                                <span className="font-medium">
                                  {activity.user.name}
                                </span>{" "}
                                <span className="text-gray-600 dark:text-gray-400">
                                  {activity.content}
                                </span>
                              </p>

                              <span className="ml-2 p-1 rounded-full bg-gray-200 dark:bg-gray-800">
                                {getActivityIcon(activity.type)}
                              </span>
                            </div>

                            {activity.target && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activity.target}
                              </p>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.timestamp}
                            </p>
                          </div>

                          {activity.type === "follow" && (
                            <Button size="sm" variant="outline">
                              Follow Back
                            </Button>
                          )}
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <Button variant="outline" className="w-full">
                      Load More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* REMINDERS */}
            <AnimatedCard delay={0.1}>
              <Card className="border-none shadow-sm bg-white dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-base">Reminders</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {reminders.map((r) => (
                      <div key={r.id} className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
                          <Calendar className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-medium text-sm">{r.title}</p>

                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <span>{r.date}</span>
                            <span className="mx-1">•</span>

                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {r.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </TabsContent>

          {/* OTHER TABS */}
          {["mentions", "comments", "likes"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card className="border-none shadow-sm bg-white dark:bg-black">
                <CardHeader>
                  <CardTitle>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Section for {tab}
                  </CardDescription>
                </CardHeader>
                <CardContent className="dark:text-gray-400">
                  <p>No {tab} yet...</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
