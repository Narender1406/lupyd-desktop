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
import { useSnackbar } from "@/components/snackbar";


export default function ActionHandler() {
  const router = useNavigate()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [allowSettingUsername, setAllowSettingUsername] = useState(false)
  const [errorText, setErrorText] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  const auth = useAuth()
  const snackbar = useSnackbar()


  useEffect(() => {
    if (auth.username) {
      router("/dashboard", { replace: true })
    }
    const user = auth.user
    if (user?.emailVerified) {
      setAllowSettingUsername(true)

      AuthHandler.getUsername(user).then((uname) => {
        if (uname) {
          router("/dashboard", { replace: true })
        }
      })


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

  const verify = async (mail: string | undefined = undefined) => {

    if (isVerifying) {
      snackbar("Verifying... Be Patient")
      return
    }

    if (auth.user?.emailVerified) {
      setAllowSettingUsername(true);
      const uname = await AuthHandler.getUsername(auth.user)
      if (uname) {
        router("/dashboard", { replace: true })
      }
      return;
    }

    const verificationLink = location.href
    const url = new URL(verificationLink)
    if (url.searchParams.get("mode") !== "signIn" && url.searchParams.has("oobCode")) {
      console.error(`Invalid URL`)
      return
    }

    const mailToVerify = mail ?? email

    if (!(mailToVerify)) {
      console.error(`Email is not valid ${email}`)
      return
    }

    console.log(`Verifying link '${verificationLink}' with email '${mailToVerify}'`)

    setIsVerifying(true)
    AuthHandler.signIn(mailToVerify, verificationLink).then(async (user) => {
      const username = await AuthHandler.getUsername(user)
      if (username != null) {
        router("/", { replace: true })
      } else {
        setAllowSettingUsername(true)
      }
      console.log(`Signed in successfully`)
    }).catch(err => { console.error(err); setErrorText("Link is invalid") }).finally(() =>
      setIsVerifying(false)
    )
  }

  const createUser = async () => {
    if (isCreatingUser) {
      snackbar("Assinging username... Be Patient")
      return
    }

    if (!isValidUsername(username)) {
      console.error(`Not a valid username`)
      setErrorText("Username is not valid, a username should only include a-zA-Z0-9_ and between length 3 to 30")
      return
    }


    const user = UserProtos.FullUser.create({
      uname: username
    })

    setIsCreatingUser(true)
    try {
      await AuthHandler.signUp(user)
      console.log(`User signed up`)

      router("/dashboard", { replace: true })
      store.remove("unassignedUsername")
    } catch (err) {
      console.error(err)
      setErrorText("Username might be taken")
    } finally {
      setIsCreatingUser(false)
    }
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

                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={createUser}>Assign Username</Button>
              </div>
              {isCreatingUser && <p>Username is being assigned, Please be patient</p>}
            </> :
              <>
                <p>Confirm email</p>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="" onChange={(e) => setEmail(e.target.value)} value={email} />
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={isVerifying ? undefined : () => verify()} >Confirm Verification</Button>
                {isVerifying && <p>Email is being verified, Please be patient</p>}
              </>
            }
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  </>
}
