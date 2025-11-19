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
import { ProfileSettings } from "@/components/dashboard/profile-settings"
import { CDN_STORAGE, FetchType, PostProtos, ulidStringify, usernameExistsInToken, UserProtos } from "lupyd-js"
import { useAuth } from "@/context/auth-context"
import { useUserData } from "@/context/userdata-context"
import { useApiService } from "@/context/apiService"

export default function ProfilePage() {
  const router = useNavigate()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showSettings, setShowSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [posts, setPosts] = useState<PostProtos.FullPost[]>([])
  const [user, setUser] = useState<UserProtos.User | null>(null)

  const params = useParams()

  // Check if the device is mobile
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
  useEffect(() => {
    if (!auth.username) {
      return
    }
    if (getUsername() === auth.username) {
      setShowSettings(true)
    }

  }, [auth])

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
          <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-b-lg">
            {/*
            <Image src={profileData.coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
              onClick={() => console.log("Change cover")}
            >
              <Camera className="h-5 w-5" />
            </Button>
            */}
          </div>

          {/* Profile Picture and Basic Info */}
          <div className="px-4 md:px-8 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={(16 == ((user?.settings ?? 0) & 16)) ? `${CDN_STORAGE}/users/${user!.uname}` : `/placeholder.svg`} alt={user?.uname} />
                  <AvatarFallback className="text-4xl">
                    {(user?.uname ?? "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-0 right-0 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                  onClick={() => console.log("Change profile picture")}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <h1 className="text-2xl font-bold">{user?.uname}</h1>
                      {/*profileData.isVerified && (
                        <span className="ml-2 bg-blue-500 text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )*/}
                    </div>
                    <p className="text-gray-500">@{user?.uname}</p>
                  </div>

                  <div className="flex mt-4 md:mt-0 space-x-2">
                    {!isMobile && (
                      <>
                        <Button variant="outline" size="sm" onClick={
                          (((user?.settings ?? 0) & 1) == 1) ?
                            () => router(`/messages/${getUsername()}`) : undefined}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>

                        <Button
                          variant={isFollowing ? "outline" : "default"}
                          size="sm"
                          onClick={handleFollow}
                        >
                          {isFollowing ? (
                            "Following"
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>

                        <Button
                         variant={isBlocked ? "outline" : "default"} size="sm" onClick={blockUser}>
                          <Ban className="h-4 w-4 " strokeWidth={3.5}/>
                          {isBlocked ? (
                            "Blocked"
                          ) :(
                            <>
                            Block </>
                          )
                          }
                        </Button>
                      </>
                    )}

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

                <p className="mt-2 text-sm"> {bio ? <PostBodyElement {...bio} /> : <></>}</p>

                {/*
                <div className="flex mt-4 space-x-6">
                  <div className="text-center">
                    <p className="font-bold">{profileData.stats.posts}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80">
                    <p className="font-bold">{profileData.stats.followers}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80">
                    <p className="font-bold">{profileData.stats.following}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
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
                  className={viewMode === "grid" ? "bg-gray-100" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === "list" ? "bg-gray-100" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="posts">
              {/*posts.map((post) => (
                    <Card key={ulidStringify(post.id)} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-0 aspect-square relative">
                        <Image
                          src={post.content.image?.src || "/placeholder.svg"}
                          alt={post.content.image?.alt || "Post image"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex items-center space-x-4 text-white">
                            <div className="flex items-center">
                              <ThumbsUp className="h-5 w-5 mr-2" />
                              <span>{post.stats.likes}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-5 w-5 mr-2" />
                              <span>{post.stats.comments}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))*/}
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={ulidStringify(post.id)} post={post} />
                ))}
              </div>

              {/*mockPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts yet</p>
                  <Button className="mt-4" onClick={() => router.push("/dashboard/profile/upload")}>
                    Create Your First Post
                  </Button>
                </div>
              )*/}
            </TabsContent>

            <TabsContent value="saved">
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
                <p className="text-gray-500 mt-4">No saved posts yet</p>
                <p className="text-sm text-gray-400">Items you save will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="tagged">
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto text-gray-300" />
                <p className="text-gray-500 mt-4">No tagged posts yet</p>
                <p className="text-sm text-gray-400">Posts you're tagged in will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Settings Sidebar - Only visible on desktop when settings are open */}
      {showSettings && !isMobile && (
        <div className="hidden md:block w-80 border-l bg-white p-4 overflow-y-auto">
          <ProfileSettings />
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => router("/settings")}
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}




