"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageIcon, Video, FileText, Smile } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { UserAvatar } from "../user-avatar"
import { useNavigate } from "react-router-dom"
import { CapacitorHttp } from "@capacitor/core"
  // import { LocalNotifications } from "@capacitor/local-notifications"

export function CreatePost() {
  const { username } = useAuth()
  const router = useNavigate()

  const goToCreatePost = () => {
    router("/create-post")
  }
  

  // async function dosomething() 
  //  {
  //   await CapacitorHttp.get({url :"http://192.168.1.4:8080"})
  //   console.log("doing-------smthng")
    
  // }
  // function showNotification() {
  //   LocalNotifications.schedule({
  //     notifications: [
  //       {
  //         title: "Hello!",
  //         body: "This is a test notification.",
  //         id: 1,
  //         schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
  //       },
  //     ],
  //   });
  // }

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <UserAvatar username={username ?? ""}/>
          <div className="flex-1">
            <Input placeholder="What's on your mind?" className="bg-gray-100 border-none"  onMouseDown={goToCreatePost}/>
            <div className="flex flex-wrap gap-2 mt-3 overflow-x-auto md:overflow-visible">
              <Button variant="ghost" size="sm" className="text-gray-500 whitespace-nowrap" onClick={goToCreatePost}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              {/* <Button variant="ghost" size="sm" className="text-gray-500 whitespace-nowrap" onClick={showNotification}>
                <ImageIcon className="h-4 w-4 mr-2" />
                developer
              </Button> */}
              <Button variant="ghost" size="sm" className="text-gray-500 whitespace-nowrap" onClick={goToCreatePost}>
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 whitespace-nowrap" onClick={goToCreatePost}>
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 whitespace-nowrap" onClick={goToCreatePost}>
                <Smile className="h-4 w-4 mr-2" />
                Feeling
              </Button>
             
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
