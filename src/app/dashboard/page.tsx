"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserCard } from "@/components/dashboard/user-card"
import { TrendingTopic as TrendingHashtag } from "@/components/dashboard/trending-topic"
import { EventCard } from "@/components/dashboard/event-card"
import { CreatePost } from "@/components/dashboard/create-post"
import { PostFeed } from "@/components/dashboard/post-feed"
import { useEffect, useState } from "react"
import { FetchType, getPosts, getTrendingHashtags, PostProtos, ulidFromString, ulidStringify, UserProtos, type GetPostsData } from "lupyd-js"
import { Loader2, TrendingUp } from "lucide-react"
import InfiniteScroll from "react-infinite-scroll-component"
import { PostCard } from "@/components/dashboard/post-card"
import { useUserData } from "@/context/userdata-context"
import store from "store2"


// Mock data
// const posts = [
//   {
//     id: "post1",
//     author: {
//       id: "user1",
//       name: "Sarah Johnson",
//       avatar: "/placeholder.svg?height=40&width=40",
//       avatarFallback: "SJ",
//     },
//     content: {
//       text: "Just finished working on my latest design project! Really excited about how it turned out. What do you think?",
//       image: {
//         src: "/test.webp?height=400&width=600",
//         alt: "Design project",
//         width: 600,
//         height: 400,
//       },
//     },
//     stats: {
//       likes: 124,
//       dislikes: 5,
//       comments: 32,
//     },
//     timestamp: "2 hours ago",
//     comments: [
//       {
//         id: "comment1",
//         author: {
//           id: "user2",
//           name: "Alex Chen",
//           avatar: "/placeholder.svg?height=40&width=40",
//           avatarFallback: "AC",
//         },
//         content: "This looks amazing! I love the color palette you chose.",
//         timestamp: "1 hour ago",
//         likes: 8,
//         dislikes: 0,
//         replies: [
//           {
//             id: "reply1",
//             author: {
//               id: "user1",
//               name: "Sarah Johnson",
//               avatar: "/placeholder.svg?height=40&width=40",
//               avatarFallback: "SJ",
//             },
//             content: "Thanks Alex! I spent a lot of time on the colors.",
//             timestamp: "45 minutes ago",
//             likes: 3,
//             dislikes: 0,
//           },
//           {
//             id: "reply2",
//             author: {
//               id: "user3",
//               name: "Emily Wong",
//               avatar: "/placeholder.svg?height=40&width=40",
//               avatarFallback: "EW",
//             },
//             content: "I agree with Alex, the colors are perfect for this type of design.",
//             timestamp: "30 minutes ago",
//             likes: 2,
//             dislikes: 0,
//             replies: [
//               {
//                 id: "reply3",
//                 author: {
//                   id: "user2",
//                   name: "Alex Chen",
//                   avatar: "/placeholder.svg?height=40&width=40",
//                   avatarFallback: "AC",
//                 },
//                 content: "The typography pairs really well with it too!",
//                 timestamp: "20 minutes ago",
//                 likes: 1,
//                 dislikes: 0,
//               },
//             ],
//           },
//         ],
//       },
//       {
//         id: "comment2",
//         author: {
//           id: "user4",
//           name: "Michael Brown",
//           avatar: "/placeholder.svg?height=40&width=40",
//           avatarFallback: "MB",
//         },
//         content: "Would love to see more of the process behind this. Did you document your workflow?",
//         timestamp: "45 minutes ago",
//         likes: 5,
//         dislikes: 1,
//         replies: [
//           {
//             id: "reply4",
//             author: {
//               id: "user1",
//               name: "Sarah Johnson",
//               avatar: "/placeholder.svg?height=40&width=40",
//               avatarFallback: "SJ",
//             },
//             content: "I did! I'll share some behind-the-scenes in my next post.",
//             timestamp: "30 minutes ago",
//             likes: 4,
//             dislikes: 0,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "post2",
//     author: {
//       id: "user2",
//       name: "Alex Chen",
//       avatar: "/placeholder.svg?height=40&width=40",
//       avatarFallback: "AC",
//     },
//     content: {
//       text: 'Just published my article on "The Future of AI in Social Networking". Check it out and let me know your thoughts!',
//       link: {
//         title: "The Future of AI in Social Networking",
//         description: "Exploring how artificial intelligence is reshaping our online social experiences...",
//         url: "#",
//       },
//     },
//     stats: {
//       likes: 89,
//       dislikes: 3,
//       comments: 15,
//     },
//     timestamp: "5 hours ago",
//     comments: [
//       {
//         id: "comment3",
//         author: {
//           id: "user5",
//           name: "Sophia Lee",
//           avatar: "/placeholder.svg?height=40&width=40",
//           avatarFallback: "SL",
//         },
//         content: "Great article! I especially liked your points about privacy concerns with AI.",
//         timestamp: "4 hours ago",
//         likes: 7,
//         dislikes: 0,
//         replies: [
//           {
//             id: "reply5",
//             author: {
//               id: "user2",
//               name: "Alex Chen",
//               avatar: "/placeholder.svg?height=40&width=40",
//               avatarFallback: "AC",
//             },
//             content: "Thanks Sophia! That was one of the most important sections for me to get right.",
//             timestamp: "3 hours ago",
//             likes: 2,
//             dislikes: 0,
//           },
//         ],
//       },
//       {
//         id: "comment4",
//         author: {
//           id: "user3",
//           name: "Emily Wong",
//           avatar: "/placeholder.svg?height=40&width=40",
//           avatarFallback: "EW",
//         },
//         content: "I'd be interested to hear more about how you think AI will impact content moderation.",
//         timestamp: "3 hours ago",
//         likes: 4,
//         dislikes: 1,
//       },
//     ],
//   },
//   {
//     id: "post3",
//     author: {
//       id: "user5",
//       name: "Design Channel",
//       avatar: "/placeholder.svg?height=40&width=40",
//       avatarFallback: "DC",
//     },
//     content: {
//       text: "Check out our latest design tutorial on creating responsive interfaces!",
//       video: {
//         src: "test2.mp4",
//         poster: "/placeholder.svg?height=480&width=854",
//         title: "Creating Responsive Interfaces - Tutorial",
//       },
//     },
//     stats: {
//       likes: 245,
//       dislikes: 8,
//       comments: 42,
//     },
//     timestamp: "3 days ago",
//     comments: [],
//   },
// ]

// const suggestedUsers = [
//   {
//     id: "user3",
//     name: "Emily Wong",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "EW",
//     subtitle: "UX Designer",
//   },
//   {
//     id: "user4",
//     name: "Michael Brown",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "MB",
//     subtitle: "Software Engineer",
//   },
//   {
//     id: "user5",
//     name: "Sophia Lee",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "SL",
//     subtitle: "Product Manager",
//   },
// ]

// const trendingTopics = [
//   {
//     id: "trend1",
//     category: "Technology",
//     hashtag: "#AIInnovation",
//     postCount: "2.5k",
//   },
//   {
//     id: "trend2",
//     category: "Design",
//     hashtag: "#MinimalistDesign",
//     postCount: "1.8k",
//   },
//   {
//     id: "trend3",
//     category: "Business",
//     hashtag: "#RemoteWork",
//     postCount: "1.2k",
//   },
// ]

// const events = [
//   {
//     id: "event1",
//     title: "Design Thinking Workshop",
//     date: {
//       month: "MAY",
//       day: "15",
//     },
//     location: "Virtual",
//     time: "2:00 PM",
//   },
//   {
//     id: "event2",
//     title: "Tech Networking Mixer",
//     date: {
//       month: "MAY",
//       day: "22",
//     },
//     location: "San Francisco",
//     time: "6:00 PM",
//   },
// ]

export default function DashboardPage() {
  const [suggestedUsers, setSuggestedUsers] = useState<UserProtos.User[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<PostProtos.PostHashtag[]>([])


  useEffect(() => {
    getTrendingHashtags().then((result) => {
      setTrendingHashtags(result.hashtags)
    }).catch(console.error)
  }, [])

  return (
    <DashboardLayout >
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto overflow-x-auto">
          <TabsTrigger
            value="feed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
          >
            Feed
          </TabsTrigger>
          {/*<TabsTrigger
            value="trending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
          >
            Trending
          </TabsTrigger>*/}
          <TabsTrigger
            value="following"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
          >
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <CreatePost />

              {/* Posts Feed with Infinite Scrolling */}
              <PostFeed />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Connections */}
              <Card className="border-none shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">People you may know</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {suggestedUsers.map((user, index) => (
                      <UserCard key={user.uname} user={user} delay={0.1 * (index + 1)} actionLabel="Connect" />
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View all
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-none shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {trendingHashtags.map((hashtag, index) => (
                      <TrendingHashtag key={hashtag.name} {...hashtag} delay={0.1 * (index + 1)} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events

              <Card className="border-none shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {events.map((event, index) => (
                      <EventCard key={event.id} {...event} delay={0.1 * (index + 1)} />
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View all events
                  </Button>
                </CardContent>
              </Card>

              */}

            </div>
          </div>
        </TabsContent>

        {/*<TabsContent value="trending" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Trending Content</CardTitle>
                <CardDescription>The most popular content across the platform right now</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Trending content will be displayed here...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>*/}

        <TabsContent value="following" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Following Feed</CardTitle>
                <CardDescription>Content from people and topics you follow</CardDescription>
              </CardHeader>
              <CardContent>
                <FollowingFeed />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}


export function FollowingFeed() {
  const [items, setItems] = useState<PostProtos.FullPost[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const userData = useUserData()
  let [minimumPostId, setMinimumPostId] = useState<Uint8Array | undefined>(undefined)

  const fetchItems = async () => {
    if (userData.follows.localUserFollows.length == 0) return;
    const details: GetPostsData = {
      fetchType: FetchType.Users,
      fetchTypeFields: [...userData.follows.localUserFollows],
      allowedPostTypes: Number(store.get("allowedPostTypes") ?? "1"),
      start: minimumPostId ? ulidStringify(minimumPostId) : undefined
    }
    const posts = await getPosts(details)
    if (posts.length === 0) { setHasMore(false); return }

    let minimumId = posts.map(e => ulidStringify(e.id)).reduce((a, b) => a > b ? b : a)
    if (!minimumPostId || ulidStringify(minimumPostId) > minimumId) {
      setMinimumPostId(ulidFromString(minimumId))
    }

    setItems((prev) => {
      const prevIds = new Set(prev.map(e => ulidStringify(e.id)))
      const newPosts = [...prev];
      for (const post of posts) {
        if (!prevIds.has(ulidStringify(post.id))) {
          newPosts.push(post)
        }
      }
      return newPosts
    })
  }


  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchItems}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      }
      endMessage={<p className="text-center py-4 text-sm text-muted-foreground">You've seen all posts for now!</p>}
    >
      {items.map((post) => {
        const id = ulidStringify(post.id)
        return (
          <div key={id} className="mb-6">
            <PostCard post={post} onDelete={(id) => setItems((prev) => prev.filter(e => !indexedDB.cmp(e.id, id)))} />
          </div>
        )
      })}
    </InfiniteScroll>
  )

}
