"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Settings, MessageSquare, Grid, List, Bookmark, Camera, MoreHorizontal, UserPlus, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PostBodyElement, PostCard } from "@/components/dashboard/post-card"
import { CDN_STORAGE, FetchType, PostProtos, ulidStringify, UserProtos } from "lupyd-js"
import { useAuth } from "@/context/auth-context"
import { useUserData } from "@/context/userdata-context"
import { useApiService } from "@/context/apiService"

export default function ProfilePage() {
  const router = useNavigate()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isMobile, setIsMobile] = useState(false)

  const [posts, setPosts] = useState<PostProtos.FullPost[]>([])
  const [user, setUser] = useState<UserProtos.User | null>(null)

  const params = useParams()

  // Detect Mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

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

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Main Content */}
      <div className="flex-1">
        {/* Profile Header */}
        <div className="relative mb-6">
          {/* Cover Image */}
          <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-b-lg" />

          {/* Profile Picture & Basic Info */}
          <div className="px-4 md:px-8 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={(16 == ((user?.settings ?? 0) & 16)) ? `${CDN_STORAGE}/users/${user!.uname}` : `/placeholder.svg`} alt={user?.uname} />
                  <AvatarFallback className="text-4xl">
                    {(user?.uname ?? "U")[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{user?.uname}</h1>
                    <p className="text-gray-500">@{user?.uname}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    {!isMobile && (
                      <>
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
                      </>
                    )}

                    {/* Mobile Menu */}
                    {isMobile && (
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
                            <UserPlus className="h-4 w-4 mr-2" />
                            {isFollowing ? "Unfollow" : "Follow"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => router("/settings")}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm">
                  {bio ? <PostBodyElement {...bio} /> : <></>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts / Saved / Tagged */}
        <div className="px-4 md:px-8">
          <Tabs defaultValue="posts" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
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

            <TabsContent value="saved">
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
                <p className="text-gray-500 mt-4">No saved posts yet</p>
              </div>
            </TabsContent>

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
  )
}
