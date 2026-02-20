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

import { Ban, Bookmark, Grid, List, MessageSquare, MoreHorizontal, Settings, UserMinus, UserPlus } from "lucide-react"
import { FetchType, PostProtos, ulidStringify, UserProtos } from "lupyd-js"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePathParams } from "@/hooks/use-path-params"

export default function ProfilePage() {
  const router = useNavigate()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [posts, setPosts] = useState<PostProtos.FullPost[]>([])
  const [savedPosts, setSavedPosts] = useState<PostProtos.FullPost[]>([])
  const [user, setUser] = useState<UserProtos.User | null>(null)

  const { username: paramUsername } = usePathParams<{ username: string }>('/user/:username')

  const getUsername = () => paramUsername

  const bio = useMemo(() => {
    if (!user) return undefined
    return PostProtos.PostBody.decode(user.bio)
  }, [user])

  const { api } = useApiService()

  useEffect(() => {
    const username = getUsername()
    if (!username) return

    // Clear stale data immediately so we don't flash old profile
    setUser(null)
    setPosts([])

    api.getUser(username).then((user) => {
      setUser(user || null)
    }).catch(console.error)

    api.getPosts({
      fetchType: FetchType.Users,
      fetchTypeFields: [username]
    }).then((posts) => {
      setPosts(posts)
    }).catch(console.error)
  }, [paramUsername])

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

  type EmptyStateProps = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    text: string;
  };

  function EmptyState({ icon: Icon, text }: EmptyStateProps) {
    return (
      <div className="py-16 text-center text-gray-400">
        <Icon className="h-10 w-10 mx-auto mb-3" />
        <p>{text}</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Profile Header */}
        <section className="pb-4">
          {/* User Info */}
          <div className="px-4 pb-4">
            <div className="flex items-end gap-4">
              <UserAvatar username={getUsername() ?? ""} />

              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">
                  {user?.uname}
                </h1>
                <p className="text-sm text-gray-500 truncate">
                  @{user?.uname}
                </p>
              </div>

              {/* Action Menu (Mobile-first) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router(`/messages/${getUsername()}`)}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Message
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleFollow}>
                    {isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={blockUser}>
                    <Ban className="h-4 w-4 mr-2" />
                    {isBlocked ? "Unblock" : "Block"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router("/settings")}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bio */}
            {bio && (
              <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                <PostBodyElement {...bio} />
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="pb-24 pt-4">
          <Tabs defaultValue="posts">
            <div className="flex items-center justify-between mb-3">
              <TabsList className="flex-1">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
                <TabsTrigger value="tagged">Tagged</TabsTrigger>
              </TabsList>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid />
                </Button>

                <Button
                  size="icon"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("list")}
                >
                  <List />
                </Button>
              </div>
            </div>

            {/* POSTS */}
            <TabsContent value="posts">
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={ulidStringify(post.id)} post={post} />
                ))}
              </div>
            </TabsContent>

            {/* SAVED */}
            {isOwnProfile && (
              <TabsContent value="saved">
                {savedPosts.length ? (
                  savedPosts.map((post) => (
                    <PostCard key={ulidStringify(post.id)} post={post} />
                  ))
                ) : (
                  <EmptyState icon={Bookmark} text="No saved posts yet" />
                )}
              </TabsContent>
            )}

            {/* TAGGED */}
            <TabsContent value="tagged">
              <EmptyState icon={UserPlus} text="No tagged posts yet" />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </DashboardLayout>
  )
}