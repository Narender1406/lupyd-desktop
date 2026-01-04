"use client"


import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostBodyElement, PostCard } from "@/components/dashboard/post-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
import { useApiService } from "@/context/apiService"
import { useAuth } from "@/context/auth-context"
import { useUserData } from "@/context/userdata-context"
import { useScrollBoundaryGuard } from "@/hooks/use-scroll-boundary-guard"
import { Ban, Bookmark, Grid, List, MessageSquare, MoreHorizontal, Settings, UserMinus, UserPlus } from "lucide-react"
import { FetchType, PostProtos, ulidStringify, UserProtos } from "lupyd-js"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

export default function ProfilePage() {
  const router = useNavigate()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [posts, setPosts] = useState<PostProtos.FullPost[]>([])
  const [savedPosts, setSavedPosts] = useState<PostProtos.FullPost[]>([])
  const [user, setUser] = useState<UserProtos.User | null>(null)

  const params = useParams()

  // Ref for the main content area
  const contentRef = useRef<HTMLDivElement>(null)

  // Apply scroll boundary guard to the main content area
  useScrollBoundaryGuard(contentRef)

  const getUsername = () => {
    const username = params.username
    if (typeof username === "string") {
      return username
    }
  }

  const bio = useMemo(() => {
    if (!user) return undefined
    return PostProtos.PostBody.decode(user.bio)
  }, [user])

  const { api } = useApiService()

  useEffect(() => {
    const username = getUsername()
    if (!username) return

    api.getUser(username).then((user) => {
      setUser(user || null)
    }).catch(console.error)

    api.getPosts({
      fetchType: FetchType.Users,
      fetchTypeFields: [username]
    }).then((posts) => {
      setPosts(posts)
    }).catch(console.error)
  }, [])

  const auth = useAuth()
  const userData = useUserData()
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!auth.username) return
    if (!getUsername()) return

    setIsFollowing(userData.follows.includes(getUsername()!))
  }, [auth, userData])

  // Load saved posts only when viewing own profile
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (auth.username === getUsername()) {
        try {
          // In a real implementation, this would fetch from the backend
          // For now, we'll simulate loading saved posts from localStorage or a similar mechanism
          // This is a placeholder implementation
          console.log("Loading saved posts for current user");
          
          // For now, we'll just set an empty array since the API doesn't seem to have a method for this
          setSavedPosts([]);
        } catch (error) {
          console.error("Error loading saved posts:", error);
          setSavedPosts([]);
        }
      } else {
        // If viewing another user's profile, saved posts should not be shown
        setSavedPosts([]);
      }
    };

    loadSavedPosts();
  }, [auth.username, getUsername()])

  const handleFollow = async () => {
    const username = getUsername()
    if (!username) return
    if (userData.follows.includes(username)) {
      await userData.relationState.unfollowUser(username)
    } else {
      await userData.relationState.followUser(username)
    }
  }


  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    if (!auth.username) return
    if (!getUsername()) return

    setIsBlocked(userData.blocked.includes(getUsername()!))
  }, [auth, userData])

  async function blockUser() {
    const username = getUsername()
    if (!username) return
    if (userData.blocked.includes(username)) {
      await userData.relationState.unblockUser(username)
    } else {
      await userData.relationState.blockUser(username)
    }

  }

  // Check if viewing own profile to determine if saved posts should be shown
  const isOwnProfile = auth.username === getUsername()

  return (
    <DashboardLayout>
      <div ref={contentRef} className="flex flex-col md:flex-row w-full max-w-6xl mx-auto" style={{ paddingBottom: '0px' }}>
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-b-lg" />

            {/* Profile Picture & Basic Info */}
            <div className="px-4 md:px-8 mt-4 relative z-10"> {/* Reduced mt-4 to mt-2 if needed */}
              <div className="flex flex-col md:flex-row md:items-end">
                <div className="relative">
                  <UserAvatar username={getUsername() ?? ""} />
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{user?.uname}</h1>
                      <p className="text-gray-500">@{user?.uname}</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex mt-4 md:mt-0 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(((user?.settings ?? 0) & 1) == 1) ? () => router(`/messages/${getUsername()}`) : undefined}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>

                          <Button
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            onClick={handleFollow}
                          >
                            {isFollowing ? "Following" : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>

                          <Button
                            variant={isBlocked ? "outline" : "default"} size="sm" onClick={blockUser}>
                            <Ban className="h-4 w-4 " strokeWidth={3.5} />
                            {isBlocked ? (
                              "Blocked"
                            ) : (
                              <>
                                Block </>
                            )
                            }
                          </Button>

                      {/* Mobile Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4 mr-2" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router(`/messages/${getUsername()}`)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleFollow}>
                              {isFollowing ? <UserMinus className="h-4 w-4 mr-2"></UserMinus> :
                                <UserPlus className="h-4 w-4 mr-2" />
                              }
                              {isFollowing ? "Unfollow" : "Follow"}
                            </DropdownMenuItem>


                            <DropdownMenuItem onClick={blockUser}>
                              <Ban className="h-4 w-4 mr-2" />
                              {isBlocked ? "Unblock" : "Block"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => router("/settings")}>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    {bio ? <PostBodyElement {...bio} /> : <></>}
                  </div>
                </div>
              </div>

              {/* Posts / Saved / Tagged */}
              <div className="px-4 md:px-8">
                <Tabs defaultValue="posts" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="posts">Posts</TabsTrigger>
                      {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
                      <TabsTrigger value="tagged">Tagged</TabsTrigger>
                    </TabsList>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`
      ${viewMode === "grid" ? "bg-gray-200 dark:bg-gray-800" : ""}
      rounded-xl
    `}
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`
      ${viewMode === "list" ? "bg-gray-200 dark:bg-gray-800" : ""}
      rounded-xl
    `}
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>

                  <TabsContent value="posts">
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={ulidStringify(post.id)} post={post} />
                      ))}
                    </div>
                  </TabsContent>

                  {isOwnProfile && (
                    <TabsContent value="saved">
                      <div className="space-y-4">
                        {savedPosts.length > 0 ? (
                          savedPosts.map((post) => (
                            <PostCard key={ulidStringify(post.id)} post={post} />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
                            <p className="text-gray-500 mt-4">No saved posts yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="tagged">
                    <div className="text-center py-12">
                      <UserPlus className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="text-gray-500 mt-4">No tagged posts yet</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}