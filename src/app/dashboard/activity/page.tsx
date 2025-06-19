"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/animated-card"
import { ThumbsUp, MessageCircle, UserPlus, Share2, Bell, Calendar, Clock } from "lucide-react"
import { Link } from "react-router-dom"

// Mock activity data
const activities = [
  {
    id: "activity1",
    type: "like",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "SJ",
    },
    content: "liked your post",
    target: '"Just finished my latest UI design project"',
    timestamp: "10 minutes ago",
  },
  {
    id: "activity2",
    type: "comment",
    user: {
      id: "user2",
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "AC",
    },
    content: "commented on your post",
    target: '"This looks amazing! I love the color palette you chose."',
    timestamp: "1 hour ago",
  },
  {
    id: "activity3",
    type: "follow",
    user: {
      id: "user3",
      name: "Emily Wong",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "EW",
    },
    content: "started following you",
    timestamp: "3 hours ago",
  },
  {
    id: "activity4",
    type: "mention",
    user: {
      id: "user4",
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "MB",
    },
    content: "mentioned you in a comment",
    target: '"@johndoe what do you think about this approach?"',
    timestamp: "Yesterday",
  },
  {
    id: "activity5",
    type: "share",
    user: {
      id: "user5",
      name: "Sophia Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "SL",
    },
    content: "shared your post",
    target: '"10 Tips for Better UI Design"',
    timestamp: "2 days ago",
  },
]

// Upcoming reminders
const reminders = [
  {
    id: "reminder1",
    title: "Design Team Meeting",
    date: "Today",
    time: "2:00 PM",
  },
  {
    id: "reminder2",
    title: "Project Deadline: UI Mockups",
    date: "Tomorrow",
    time: "5:00 PM",
  },
  {
    id: "reminder3",
    title: "Call with Client",
    date: "May 15",
    time: "11:00 AM",
  },
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground">Track your interactions and stay updated on your network</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              All Activity
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Mentions
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <AnimatedCard>
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your latest interactions and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activities.map((activity, index) => (
                          <AnimatedCard key={activity.id} delay={0.05 * index}>
                            <div className="flex items-start space-x-4 py-2">
                              <Avatar>
                                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                <AvatarFallback>{activity.user.avatarFallback}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center">
                                  <p>
                                    <span className="font-medium">{activity.user.name}</span>{" "}
                                    <span className="text-muted-foreground">{activity.content}</span>
                                  </p>
                                  <span className="ml-2 flex items-center justify-center rounded-full bg-gray-100 p-1">
                                    {getActivityIcon(activity.type)}
                                  </span>
                                </div>
                                {activity.target && <p className="text-sm text-muted-foreground">{activity.target}</p>}
                                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
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
              </div>

              <div className="space-y-6">
                <AnimatedCard delay={0.1}>
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Reminders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reminders.map((reminder, index) => (
                          <div key={reminder.id} className="flex items-start space-x-3">
                            <div className="bg-gray-100 rounded-full p-2">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{reminder.title}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{reminder.date}</span>
                                <span className="mx-1">•</span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {reminder.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Profile views</span>
                          <span className="font-medium">128</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Post impressions</span>
                          <span className="font-medium">2,456</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">New followers</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Engagement rate</span>
                          <span className="font-medium">4.2%</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link to="/dashboard/analytics">
                          <Button variant="outline" size="sm" className="w-full">
                            View Full Analytics
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mentions" className="mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Mentions</CardTitle>
                <CardDescription>All the times you've been mentioned by others</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your mentions will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>Comments on your posts and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your comments will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Likes</CardTitle>
                <CardDescription>People who liked your content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your likes will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

