"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserCard } from "@/components/dashboard/user-card"
import { TrendingTopic as TrendingHashtag } from "@/components/dashboard/trending-topic"
import { CreatePost } from "@/components/dashboard/create-post"
import { PostFeed } from "@/components/dashboard/post-feed"
import { useEffect, useState } from "react"
import { FetchType, getPosts, getTrendingHashtags, PostProtos, ulidFromString, ulidStringify, UserProtos, type GetPostsData } from "lupyd-js"
import { Loader2, TrendingUp } from "lucide-react"
import InfiniteScroll from "react-infinite-scroll-component"
import { PostCard } from "@/components/dashboard/post-card"
import { useUserData } from "@/context/userdata-context"
import store from "store2"


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
