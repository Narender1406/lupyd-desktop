"use client"


import { AnimatedCard } from "@/components/animated-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff } from "lucide-react";
import { AuthHandler, isValidUsername, UserProtos } from "lupyd-js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import store from "store2";


export default function ActionHandler() {
  const router = useNavigate()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [allowSettingUsername, setAllowSettingUsername] = useState(false)
  const [errorText, setErrorText] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  // const [password, setPassword] = useState("")
  // const [showPassword, setShowPassword] = useState(false)

  const auth = useAuth()


  useEffect(() => {
    if (auth.username) {
      router("/dashboard", { replace: true})
    }
    const user = auth.user
    if (user?.emailVerified) {
      setAllowSettingUsername(true)
    }
  }, [auth])

  useEffect(() => {

    if (allowSettingUsername) {
      return
    }

    const unassignedUsername = store.get("unassignedUsername")
    if (username == "" && unassignedUsername && typeof unassignedUsername === "string") {
      setUsername(unassignedUsername)
    }

    const mail = store.get("email")

    if (!mail) {
      console.warn("We don't know the email of the user")
      return
    }
    setEmail(mail)

    verify(mail)
  }, [])

  const verify = (mail: string | undefined = undefined) => {
    const verificationLink = location.href
    const url = new URL(verificationLink)
    if (url.searchParams.get("mode") !== "signIn" && url.searchParams.has("oobCode")) {
      console.error(`Invalid URL`)
      return
    }

    if (!(mail ?? email)) {
      console.error(`Email is not valid ${email}`)
      return
    }

    console.log(`Verifying link '${verificationLink}' with email '${email}'`)

    if (isVerifying) {
      return
    }
    setIsVerifying(true)
    AuthHandler.signIn(mail ?? email, verificationLink).then(async (user) => {
      const username = await AuthHandler.getUsername(user)
      if (username != null) {
        router("/", { replace: true})
      } else {
        setAllowSettingUsername(true)
      }
    }).catch(err => { console.error(err); setErrorText("Username might be taken") }).finally(() =>
      setIsVerifying(false)
    )
  }

  const createUser = async () => {

    if (!isValidUsername(username)) {
      console.error(`Not a valid username`)
      return
    }


    // if (password.length < 8) {
    //   console.error(`Password must be longer than 8 characters`)
    //   return
    // }

    const user = UserProtos.FullUser.create({
      uname: username
    })


    // await AuthHandler.changePassword(password)
    // console.log(`Password is linked`)

    await AuthHandler.signUp(user)
    console.log(`User signed up`)

    router("/", { replace: true})
    store.remove("unassignedUsername")
  }

  return <>
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <AnimatedCard>
        <Card>
          <CardContent>
            {allowSettingUsername ? <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="" onChange={(e) => setUsername(e.target.value)} value={username} />
                <p>{errorText}</p>


                {/*
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
        </div>

      */}

                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={createUser}>Assign Username</Button>
              </div>
            </> :
              <div>

                <p>Verifying...</p>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="" onChange={(e) => setEmail(e.target.value)} value={email} />
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={isVerifying ? undefined : () => verify()} >Confirm Verification</Button>
              </div>

            }
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  </>
}
