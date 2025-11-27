"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostBodyElement, PostCard } from "@/components/dashboard/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserData } from "@/context/userdata-context"
import { Filter, Search, TrendingUp, Users } from "lucide-react"
import { FetchType, PostProtos, UserProtos, ulidStringify } from "lupyd-js"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import React, {  useEffect, useMemo, useState } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { useApiService } from "@/context/apiService"

// Mock data for trending topics
// const trendingTopics = [
//   { id: "topic1", name: "Design", count: "2.5k posts" },
//   { id: "topic2", name: "Technology", count: "4.2k posts" },
//   { id: "topic3", name: "Marketing", count: "1.8k posts" },
//   { id: "topic4", name: "Productivity", count: "3.1k posts" },
//   { id: "topic5", name: "AI", count: "5.7k posts" },
//   { id: "topic6", name: "Remote Work", count: "2.3k posts" },
// ]

// Mock data for suggested users
// const suggestedUsers = [
//   {
//     id: "user1",
//     name: "Emily Wong",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "EW",
//     subtitle: "UX Designer at DesignCo",
//     description: "12 mutual connections",
//   },
//   {
//     id: "user2",
//     name: "Michael Brown",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "MB",
//     subtitle: "Software Engineer at TechCorp",
//     description: "8 mutual connections",
//   },
//   {
//     id: "user3",
//     name: "Sophia Lee",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "SL",
//     subtitle: "Product Manager at InnovateCo",
//     description: "5 mutual connections",
//   },
//   {
//     id: "user4",
//     name: "David Kim",
//     avatar: "/placeholder.svg?height=40&width=40",
//     avatarFallback: "DK",
//     subtitle: "Frontend Developer at WebTech",
//     description: "3 mutual connections",
//   },
// ]

// Mock data for communities
// const communities = [
//   {
//     id: "community1",
//     name: "UX/UI Designers",
//     members: "5.2k members",
//     image: "/placeholder.svg?height=80&width=80",
//   },
//   {
//     id: "community2",
//     name: "Frontend Developers",
//     members: "8.7k members",
//     image: "/placeholder.svg?height=80&width=80",
//   },
//   {
//     id: "community3",
//     name: "Product Managers",
//     members: "3.4k members",
//     image: "/placeholder.svg?height=80&width=80",
//   },
//   {
//     id: "community4",
//     name: "Startup Founders",
//     members: "2.1k members",
//     image: "/placeholder.svg?height=80&width=80",
//   },
// ]

export default function DiscoverPage() {


  const [searchText, setSearchText] = useState("")

  const [posts, setPosts] = useState<Array<PostProtos.FullPost>>([])
  const [users, setUsers] = useState<Array<UserProtos.User>>([])


  const { api } = useApiService()


  const search = async (query: string) => {

    console.log(`Searching for '${query}'`)

    if (query.length < 2) {
      console.log(`Not enough info to search for`)
      return
    }


    const promises: Array<Promise<any>> = []
    // posts
    {
      if (query.length > 3) {
        const postsFuture = api.getPosts({
          fetchType: FetchType.Search,
          fetchTypeFields: query,
        }).then((results) => {
          setPosts(results)
          for (const post of results) {
            console.log(post)
          }

        })

        promises.push(postsFuture)
      }
    }

    {
      const usersFuture = api.getUsers(query).then((results) => {
        setUsers(results)
        for (const user of results) {
          console.log(user)
        }
      })
      promises.push(usersFuture)

    }

    await Promise.all(promises)
  }


  const router = useNavigate()
  const onSearchFieldKeyDown = (e: React.KeyboardEvent) => {
    const keyCode = e.code || e.key
    if (keyCode != 'Enter') {
      return
    }

    if (!(searchText.trim())) {
      return
    }


    const to = `/discover?q=${encodeURIComponent(searchText)}`

    router(to)

    // search(searchText)
  }


  const [searchParams, _] = useSearchParams()

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchText(query)
      search(query)
      return
    }

    const hashtag = searchParams.get("hashtag")
    if (hashtag) {
      const offset = Number(searchParams.get("offset")) || 0
      api.getPosts({ fetchType: FetchType.Hashtag, fetchTypeFields: hashtag, offset }).then((posts) => {
        setPosts(posts)
      })
      return
    }


  }, [searchParams])



  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-full overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">Explore new content, people, and communities</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
         <div className="relative flex-1 w-full"> <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
           placeholder="Search for people, topics, or content..."
            className="
            pl-10 
            bg-white dark:bg-black
            text-black dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            border border-gray-300 dark:border-gray-600
            rounded-md w-full shadow-sm
           focus:border-black dark:focus:border-white
            focus:ring-black dark:focus:ring-white
              "
          onKeyDown={onSearchFieldKeyDown}
            value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
            />

          </div>
          <Button variant="outline" className="flex items-center w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="overflow-hidden">
          <Tabs defaultValue="posts" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto flex-nowrap">
                <TabsTrigger
                  value="posts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />


                  Posts

                  {posts.length != 0 &&

                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm font-semibold text-gray-700">
                      {posts.length.toString()}
                    </span>
                  }

                </TabsTrigger>
                <TabsTrigger
                  value="people"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <Users className="h-4 w-4 mr-2" />
                  People

                  {users.length != 0 &&
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm font-semibold text-gray-700">
                      {users.length.toString()}
                    </span>
                  }

                </TabsTrigger>

                {/*
                <TabsTrigger
                  value="topics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Topics
                </TabsTrigger>
                <TabsTrigger
                  value="communities"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Communities
                </TabsTrigger>

              */}

              </TabsList>
            </div>

            <TabsContent value="posts" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold">Posts
                  </h2>

                  {posts.map(post => <PostCard key={ulidStringify(post.id)} post={post} />)}
                  {/* Trending Post 1 */}
                  {/*
                  <AnimatedCard>
                    <Card className="border-none shadow-sm overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="flex-shrink-0">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Johnson" />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Sarah Johnson</p>
                                <p className="text-sm text-muted-foreground">2 hours ago</p>
                              </div>
                            </div>
                            <p className="mt-2 break-words">
                              Just finished working on my latest design project! Really excited about how it turned out.
                              What do you think?
                            </p>
                            <div className="mt-3 rounded-md overflow-hidden">
                              <Image
                                src="/placeholder.svg?height=400&width=600"
                                alt="Design project"
                                width={600}
                                height={400}
                                className="w-full object-cover"
                              />
                            </div>
                            <div className="flex items-center mt-4 gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                <span>324</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                <span>56</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                  <AnimatedCard delay={0.1}>
                    <Card className="border-none shadow-sm overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="flex-shrink-0">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alex Chen" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Alex Chen</p>
                                <p className="text-sm text-muted-foreground">5 hours ago</p>
                              </div>
                            </div>
                            <p className="mt-2 break-words">
                              Just published my article on "The Future of AI in Social Networking". Check it out and let
                              me know your thoughts!
                            </p>
                            <div className="mt-3 border rounded-md p-4">
                              <h3 className="font-medium">The Future of AI in Social Networking</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Exploring how artificial intelligence is reshaping our online social experiences...
                              </p>
                            </div>
                            <div className="flex items-center mt-4 gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                <span>189</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                <span>42</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>*/}
                </div>

                <div className="space-y-6">
                  {/*
                  <AnimatedCard delay={0.2}>
                    <Card className="border-none shadow-sm w-full overflow-hidden">
                      <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-base">Trending Topics</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {trendingTopics.map((topic) => (
                            <div key={topic.id} className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-sm truncate">#{topic.name}</p>
                              <p className="text-xs text-muted-foreground">{topic.count}</p>
                            </div>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          View All Topics
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

              */}

                  {/*

                  <AnimatedCard delay={0.3}>
                    <Card className="border-none shadow-sm w-full overflow-hidden">
                      <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-base">Suggested For You</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-2">
                        <div className="space-y-4">

                          {users.map(user => (<UserCard key={user.uname} {...user} />))}


                          {suggestedUsers.slice(0, 2).map((user) => (
                            <div key={user.id} className="flex items-center justify-between">
                              <div className="flex items-center min-w-0">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="ml-3 overflow-hidden">
                                  <p className="font-medium text-sm truncate">{user.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.subtitle}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="flex-shrink-0 ml-2">
                                Connect
                              </Button>
                            </div>
                          ))}
                       </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          View More Suggestions
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                */}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="people" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {users.map(user => (<UserCard key={user.uname} {...user} />))}


                {/*                {suggestedUsers.map((user, index) => (
                  <AnimatedCard key={user.id} delay={index * 0.1}>
                    <Card className="border-none shadow-sm h-full w-full overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg">{user.name}</h3>
                          <p className="text-muted-foreground mb-2">{user.subtitle}</p>
                          <p className="text-sm text-muted-foreground mb-4">{user.description}</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                ))}
                */}
              </div>
            </TabsContent>

            {/*

            <TabsContent value="topics" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTopics.map((topic, index) => (
                  <AnimatedCard key={topic.id} delay={index * 0.1}>
                    <Card className="border-none shadow-sm h-full w-full overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <Hash className="h-8 w-8" />
                          </div>
                          <h3 className="font-bold text-lg">#{topic.name}</h3>
                          <p className="text-muted-foreground mb-4">{topic.count}</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Follow</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="communities" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community, index) => (
                  <AnimatedCard key={community.id} delay={index * 0.1}>
                    <Card className="border-none shadow-sm h-full w-full overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <Image
                              src={community.image || "/placeholder.svg"}
                              alt={community.name}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-lg">{community.name}</h3>
                          <p className="text-muted-foreground mb-4">{community.members}</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Join</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

          */}

          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}


function UserCard(user: UserProtos.User) {

  const router = useNavigate()
  const [isFollowing, setIsFollowing] = useState(false)

  const bio = user.bio.length > 0 ? PostProtos.PostBody.decode(user.bio) : PostProtos.PostBody.create({ plainText: "" })
  const auth = useAuth()

  const userData = useUserData()

  const connect = () => {
    router(`/messages/${user.uname}`)
  }

  useEffect(() => {
    setIsFollowing(userData.follows.includes(user.uname))
    console.log(`isFollowing '${user.uname}'? : ${isFollowing}`)
  }, [userData])

  const handleFollow = () => {
    if (isFollowing) {
      userData.relationState.unfollowUser(user.uname)
      setIsFollowing(false)
    } else {
      userData.relationState.followUser(user.uname)
      setIsFollowing(true)
    }
  }

  const isMe = useMemo(() => auth.username == user.uname, [auth])

  return (<>
    <Link to={`/user/${user.uname}`}>
      <div key={user.uname} className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <UserAvatar username={user.uname} />
          <div className="ml-3 overflow-hidden">
            <p className="font-medium text-sm truncate">{user.uname}</p>
            <div className="text-xs text-muted-foreground truncate">
              <PostBodyElement {...bio} />
            </div>
          </div>
        </div>

        {(!isMe && (user.settings & 1) == 1) &&
          <Button variant="outline" size="sm" className="flex-shrink-0 ml-2" onClick={connect}>
            Connect
          </Button>
        }
        {
          !isMe &&
          (<Button variant="outline" size="sm" className="flex-shrink-0 ml-2" onClick={handleFollow}>
            {!isFollowing ? "Follow" : "Unfollow"}
          </Button>
          )}
      </div>
    </Link>
  </>)
}
