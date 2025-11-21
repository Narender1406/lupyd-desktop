"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/dashboard/post-card"
import { AnimatedCard } from "@/components/animated-card"
import { Bookmark, Grid, List, Search, Filter, Clock, ImageIcon, Video, Link2 } from "lucide-react"

// Mock saved posts data
const savedPosts = [
  {
    id: "post1",
    author: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "SJ",
    },
    content: {
      text: "Just finished working on my latest design project! Really excited about how it turned out. What do you think?",
      image: {
        src: "/placeholder.svg?height=400&width=600",
        alt: "Design project",
        width: 600,
        height: 400,
      },
    },
    stats: {
      likes: 324,
      comments: 56,
    },
    timestamp: "2 days ago",
    savedAt: "Yesterday at 3:45 PM",
  },
  {
    id: "post2",
    author: {
      id: "user2",
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "AC",
    },
    content: {
      text: 'Just published my article on "The Future of AI in Social Networking". Check it out and let me know your thoughts!',
      link: {
        title: "The Future of AI in Social Networking",
        description: "Exploring how artificial intelligence is reshaping our online social experiences...",
        url: "#",
      },
    },
    stats: {
      likes: 189,
      comments: 42,
    },
    timestamp: "1 week ago",
    savedAt: "3 days ago at 10:15 AM",
  },
  {
    id: "post3",
    author: {
      id: "user3",
      name: "Emily Wong",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "EW",
    },
    content: {
      text: "Here's a quick tutorial on creating responsive layouts with CSS Grid. Hope you find it useful!",
      video: {
        src: "#",
        thumbnail: "/placeholder.svg?height=400&width=600",
        alt: "CSS Grid Tutorial",
        width: 600,
        height: 400,
      },
    },
    stats: {
      likes: 256,
      comments: 38,
    },
    timestamp: "2 weeks ago",
    savedAt: "1 week ago at 5:30 PM",
  },
  {
    id: "post4",
    author: {
      id: "user4",
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "MB",
    },
    content: {
      text: "Just launched our new product! After months of hard work, I'm proud to share what our team has built. Check out the link for more details.",
      link: {
        title: "New Product Launch",
        description: "Introducing our latest innovation that will change how you work...",
        url: "#",
      },
    },
    stats: {
      likes: 412,
      comments: 87,
    },
    timestamp: "3 weeks ago",
    savedAt: "2 weeks ago at 9:20 AM",
  },
]

export default function SavedPostsPage() {
  const [view, setView] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter posts based on search query and active tab
  const filteredPosts = savedPosts.filter((post) => {
    const matchesSearch =
      post.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "images") return matchesSearch && post.content.image
    if (activeTab === "videos") return matchesSearch && post.content.video
    if (activeTab === "links") return matchesSearch && post.content.link

    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Saved Posts</h1>
          <p className="text-muted-foreground">Posts you've bookmarked for later</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
        placeholder="Search saved posts..."
        className="pl-10 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm dark:text-white"
         value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
        </div>


          <div className="flex items-center space-x-2 w-full sm:w-auto">
           <Button
  variant="outline"
  size="icon"
  className={view === "list" ? "bg-gray-100 dark:bg-zinc-800" : ""}
  onClick={() => setView("list")}
>
  <List className="h-4 w-4" />
</Button>

            <Button
              variant="outline"
              size="icon"
              className={view === "grid" ? "bg-gray-100" : ""}
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center ml-2">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto flex-nowrap">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                All Saved
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
              >
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Links
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recently Saved
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {filteredPosts.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredPosts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={0.1 * (index + 1)}>
                    {/*                    <PostCard post={post} />
                    TODO: saved posts
*/}                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No posts match your search criteria" : "You haven't saved any posts yet"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            {/* Similar content structure as "all" tab but filtered for images */}
            {filteredPosts.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredPosts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={0.1 * (index + 1)}>
                    <div/>
                    {/**/}
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved images found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No images match your search criteria" : "You haven't saved any posts with images yet"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            {/* Similar content structure as "all" tab but filtered for videos */}
            {filteredPosts.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredPosts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={0.1 * (index + 1)}>
                    <div/>
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved videos found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No videos match your search criteria" : "You haven't saved any posts with videos yet"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-0">
            {/* Similar content structure as "all" tab but filtered for links */}
            {filteredPosts.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredPosts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={0.1 * (index + 1)}>
                    <div/>
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Link2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved links found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No links match your search criteria" : "You haven't saved any posts with links yet"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            {/* Similar content structure as "all" tab but sorted by savedAt date */}
            {filteredPosts.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredPosts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={0.1 * (index + 1)}>
                    <div/>
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No recently saved posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No recent posts match your search criteria" : "You haven't saved any posts recently"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
