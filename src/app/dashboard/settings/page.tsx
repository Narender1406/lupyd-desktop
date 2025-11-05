"use client"

import { useEffect, useState } from "react"
import {
  Camera,
  Lock,
  Eye,
  Globe,
  Languages,
  Shield,
  Smartphone,
  Mail,
  Clock,
  UserMinus,
  Download,
  Megaphone,
  Heart,
  BellOff,
  Accessibility,
} from "lucide-react"
import { useTheme } from "next-themes"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard } from "@/components/animated-card"
import { useAuth } from "@/context/auth-context"
import { CDN_STORAGE, PostProtos, UserProtos } from "lupyd-js"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useApiService } from "@/context/apiService"





export default function SettingsPage() {
  // const [activeTab, setActiveTab] = useState("account")
  const [pfpSrc, setPfpSrc] = useState("")
  const [allowChats, setAllowChats] = useState(false)
  const [bio, setBio] = useState("")
  const [initialUserData, setInitialUserData] = useState<UserProtos.User | null>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


  const auth = useAuth()
  const { api } = useApiService()


  useEffect(() => {
    if (auth.username) {
      api.getUser(auth.username).then((user) => {
        if (!user) throw Error("User not found")
        if ((user.settings & 16) == 16) {
          setPfpSrc(`${CDN_STORAGE}/users/${auth.username}`)
        }
        setAllowChats((user.settings & 1) == 1)
        const bioBody = PostProtos.PostBody.decode(user.bio)
        setBio(bioBody.plainText ?? bioBody.markdown ?? "")

        setInitialUserData(user)
      })
    }
  }, [auth])
  function pickProfileImage(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false
    input.onchange = () => {
      if (input.files == null || input.files.length == 0) return
      const file = input.files[0]
      const url = URL.createObjectURL(file);
      setPfpSrc(url)
    };
    input.click();

  }

  const onSubmit = async () => {

    let isBioChanged = false
    if (initialUserData?.bio) {
      const oldBio = PostProtos.PostBody.decode(initialUserData!.bio)
      if (oldBio.plainText !== bio && oldBio.markdown !== bio) {
        isBioChanged = true
      }
    }

    const isPfpChanged = pfpSrc.startsWith("blob")
    if (isPfpChanged) {
      const pfp = await fetch(pfpSrc)
      const blob = await pfp.blob()
      await api.updateUserProfilePicture(blob)
    }

    let settings = initialUserData?.settings ?? 0;
    if (allowChats) {
      settings = settings | 1;
    } else {
      settings = settings & ~1;
    }

    if (pfpSrc) {
      settings = settings | 16;
    } else {
      settings = settings & ~16;
    }


    const info = UserProtos.UpdateUserInfo.create({
      bio: isBioChanged ? PostProtos.PostBody.create({ plainText: bio }) : undefined,
      settings: settings
    })


    await api.updateUser(info)
    setInitialUserData(UserProtos.User.create({
      uname: initialUserData!.uname,
      bio: isBioChanged ? PostProtos.PostBody.encode(PostProtos.PostBody.create({ plainText: bio })).finish() : initialUserData!.bio,
      settings: settings,
    }))

  }


  async function deleteAccount() {
    await api.deleteUser();
    await auth.logout();
  }

  // function updatePassword(): void {
  //   if (password !== confirmPassword) {
  //     console.error(`Passwords don't match`)
  //     return
  //   }

  //   if (password.length < 6) {
  //     console.error(`Password length < 6`)
  //     return
  //   }

  //   AuthHandler.changePassword(password).then(() => auth.logout()).catch(console.error)
  // }

  // const user = {
  //   name: "John Doe",
  //   username: "johndoe",
  //   avatar: "/placeholder.svg?height=40&width=40",
  // }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-full overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
            <div className="min-w-max px-4 sm:px-0">
              <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto flex-nowrap">
                <TabsTrigger
                  value="account"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  Notifications
                </TabsTrigger>
                
                <TabsTrigger
                  value="preferences"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  Preferences
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  About
                </TabsTrigger>
                
              </TabsList>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <TabsContent value="account" className="mt-0 space-y-6 w-full">
              <AnimatedCard>
                <Card className="border-none shadow-sm w-full overflow-hidden">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and how others see you on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-visible">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                      <div className="relative flex justify-center sm:justify-start">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={pfpSrc} alt={auth.username ?? "user"} />
                          <AvatarFallback className="text-2xl">
                            {(auth.username ?? "U")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white"
                          onClick={pickProfileImage}>
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" className="w-full" value={auth.username ?? ""} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about yourself"
                            className="min-h-[100px] w-full"
                            value={bio}
                            onChange={(e) => setBio(e.currentTarget.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="allowChats" className="text-base font-medium text-gray-700">
                        Allow Chats
                      </Label>
                      <Switch
                        id="allowChats"
                        checked={allowChats}
                        onCheckedChange={setAllowChats}
                      />
                    </div>

                    <Separator />
                    <div className="flex justify-end">
                      <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto" onClick={onSubmit}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                   {/*  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <h3 className="font-medium">Deactivate Account</h3>
                        <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                      </div>
                    </div>*/}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                           <Button
                            onClick={() => {
                          if (window.confirm("Are you sure you want to delete your account permanently?")) {
                           deleteAccount();
                        }
                        }}
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto mt-2 sm:mt-0">
                          Delete
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0 space-y-6">
              <PrivacySection />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <NotificationsSection />
            </TabsContent>

            
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <PreferencesSection />
            </TabsContent>
            <TabsContent value="about"  className="mt-0 flex flex-col items-start space-y-4 bg-white text-black dark:bg-black dark:text-white p-6 rounded-lg">
            <div className="flex flex-col items-center justify-center text-center w-full px-6 py-10 
                  bg-white text-black dark:bg-black dark:text-white rounded-lg space-y-8">

               {/* Header */}
                <div>
              <h1 className="text-4xl font-extrabold text-black dark:text-white">Privacy Center</h1>
               <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                Your privacy matters to us more.
          </p>
          </div>

           {/* PrivacySection */}
            <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Privacy at Lupyd</h2>
           <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            At Lupyd, we value your trust and are committed to keeping your personal data safe.  
            We never share your information without consent and use secure systems to protect your identity.  
              Your privacy is at the heart of everything we build.
            </p>

          {/* Privacy Button (Round Black/White) */}
            <Link to="/privacy"className="inline-block px-5 py-2 rounded-md 
               bg-black text-white hover:bg-gray-800 
             dark:bg-white dark:text-black dark:hover:bg-gray-200 
             transition text-sm font-medium"
        >
        Privacy Policy
        
          </Link>
        </div>

    {/* Terms Section */}
        <div className="max-w-2xl pt-6 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-2">Terms of Use</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        By using Lupyd, you agree to follow our community standards and respect others’ rights.  
        Our Terms of Use are designed to create a safe, transparent, and fair platform for everyone.  
        We encourage you to read and understand them carefully.
         </p>

      {/* Terms Button (Round Black/White) */}
      <Link to="/terms-of-use"
          className="inline-block px-5 py-2 rounded-md 
             bg-black text-white hover:bg-gray-800 
             dark:bg-white dark:text-black dark:hover:bg-gray-200 
             transition text-sm font-medium"
            >
          Terms Of Use
          </Link>
          </div>
          {/* Terms Section */}
<div className="max-w-2xl pt-6 border-t border-gray-200 dark:border-gray-800">
  <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
    By using Lupyd, you agree to comply with our Terms of Service, which outline your rights and responsibilities when using our platform.  
    These terms ensure transparency, fairness, and a safe community for all users.  
    Please take a moment to review them before continuing to use Lupyd.
  </p>

  {/* Terms of Service Button */}
  <Link 
    to="/terms-of-service"
    className="inline-block px-5 py-2 rounded-md 
               bg-black text-white hover:bg-gray-800 
               dark:bg-white dark:text-black dark:hover:bg-gray-200 
               transition text-sm font-medium"
  >
    Terms of Service
  </Link>
</div>

          </div>
          </TabsContent>

            
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


function PrivacySection() {

  return (
    <AnimatedCard>
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control who can see your content and how your data is used</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <Label htmlFor="publicProfile">Public Profile</Label>
                </div>
                <p className="text-sm text-muted-foreground">Allow anyone to view your profile</p>
              </div>
              <Switch id="publicProfile" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <Label htmlFor="privateAccount">Private Account</Label>
                </div>
                <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
              </div>
              <Switch id="privateAccount" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Blocked Accounts</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center">
                <UserMinus className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Manage Blocked Users</h3>
                  <p className="text-sm text-muted-foreground">Review and unblock accounts</p>
                </div>
              </div>
              <Button
            onClick={() => alert("No blocked accounts")}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
            >
           View Blocked Accounts
            </Button>

            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">True Friends List</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Manage True Friends</h3>
                  <p className="text-sm text-muted-foreground">Edit your true friends list</p>
                </div>
              </div>
              <Button className="w-full sm:w-auto mt-2 sm:mt-0">
                Edit Close Friends
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              Save Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>

  )

}

function PreferencesSection() {
  const { theme, setTheme } = useTheme()
  return (
    <AnimatedCard>
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup
                value={theme ?? "system"} // ✅ fallback for undefined
                // onValueChange={(value) => setTheme(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System default</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Language
            </h3>
            <div className="space-y-2">
              <Label htmlFor="language">Select language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium flex items-center">
              <Accessibility className="h-4 w-4 mr-2" />
              Accessibility
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reducedMotion" className="flex-1">
                  Reduce motion
                </Label>
                <Switch id="reducedMotion" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="highContrast" className="flex-1">
                  High contrast mode
                </Label>
                <Switch id="highContrast" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="largeText" className="flex-1">
                  Larger text
                </Label>
                <Switch id="largeText" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium flex items-center">
              <Megaphone className="h-4 w-4 mr-2" />
              Ad Preferences
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="personalizedAds" className="flex-1">
                  Personalized ads
                </Label>
                <Switch id="personalizedAds" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="adTopics" className="flex-1">
                  Manage ad topics
                </Label>
                <Button>
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}


function NotificationsSection() {
  return <>


    <AnimatedCard>
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Email Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailMessages" className="flex-1">
                  Direct messages
                </Label>
                <Switch id="emailMessages" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailMentions" className="flex-1">
                  Mentions and tags
                </Label>
                <Switch id="emailMentions" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailFollows" className="flex-1">
                  New followers
                </Label>
                <Switch id="emailFollows" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailComments" className="flex-1">
                  Comments on your posts
                </Label>
                <Switch id="emailComments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailLikes" className="flex-1">
                  Likes on your posts
                </Label>
                <Switch id="emailLikes" />
              </div>
            </div>

            <h3 className="font-medium pt-4">Push Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushMessages" className="flex-1">
                  Direct messages
                </Label>
                <Switch id="pushMessages" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushMentions" className="flex-1">
                  Mentions and tags
                </Label>
                <Switch id="pushMentions" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushFollows" className="flex-1">
                  New followers
                </Label>
                <Switch id="pushFollows" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushComments" className="flex-1">
                  Comments on your posts
                </Label>
                <Switch id="pushComments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushLikes" className="flex-1">
                  Likes on your posts
                </Label>
                <Switch id="pushLikes" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Muted Accounts</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center">
                <BellOff className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Manage Muted Accounts</h3>
                  <p className="text-sm text-muted-foreground">Review and unmute accounts</p>
                </div>
              </div>
              <Button className="w-full sm:w-auto mt-2 sm:mt-0">
                View Muted Accounts
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  </>
}
