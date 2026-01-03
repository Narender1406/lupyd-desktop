"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/dashboard/post-card"

import { AnimatedCard } from "@/components/animated-card"
import { Bookmark, Grid, List, Search, Filter, Clock, ImageIcon, Video, Link2 } from "lucide-react"
import { PostProtos, ulidStringify } from "lupyd-js"

export default function SavedPostsPage() {
  const [view, setView] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [savedPosts, setSavedPosts] = useState<PostProtos.FullPost[]>([])

  // Load saved posts
  useState(() => {
    const loadSavedPosts = async () => {
      try {
        // In a real implementation, this would fetch saved posts from the API
        // For now, we'll just set an empty array since the API doesn't seem to have a method for this
        // This is a placeholder until the backend API is ready
        console.log("Loading saved posts");
        setSavedPosts([]);
      } catch (error) {
        console.error("Error loading saved posts:", error);
        setSavedPosts([]);
      }
    };

    loadSavedPosts();
  });

  // Filter posts based on search query and active tab
  const filteredPosts = savedPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.by.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    // Additional filtering logic would go here based on post content
    // For now, since we don't have actual saved posts, this is just a placeholder

    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 md:pb-0">
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
                  <AnimatedCard key={ulidStringify(post.id)} delay={0.1 * (index + 1)}>
                    <PostCard post={post} />
                  </AnimatedCard>
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
                {filteredPosts
                  .filter(() => {
                    // Filter for posts with images - this is a placeholder
                    // In a real implementation, we would check the post content for images
                    return true;
                  })
                  .map((post, index) => (
                  <AnimatedCard key={ulidStringify(post.id)} delay={0.1 * (index + 1)}>
                    <PostCard post={post} />
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
                {filteredPosts
                  .filter(() => {
                    // Filter for posts with videos - this is a placeholder
                    // In a real implementation, we would check the post content for videos
                    return true;
                  })
                  .map((post, index) => (
                  <AnimatedCard key={ulidStringify(post.id)} delay={0.1 * (index + 1)}>
                    <PostCard post={post} />
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
                {filteredPosts
                  .filter(() => {
                    // Filter for posts with links - this is a placeholder
                    // In a real implementation, we would check the post content for links
                    return true;
                  })
                  .map((post, index) => (
                  <AnimatedCard key={ulidStringify(post.id)} delay={0.1 * (index + 1)}>
                    <PostCard post={post} />
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
                {filteredPosts
                  .sort((a, b) => {
                    // Sort by ID timestamp as a proxy for save time - this is a placeholder
                    return ulidStringify(b.id).localeCompare(ulidStringify(a.id));
                  })
                  .map((post, index) => (
                  <AnimatedCard key={ulidStringify(post.id)} delay={0.1 * (index + 1)}>
                    <PostCard post={post} />
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