"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard } from "@/components/animated-card"
import { rawEmailRegex } from "lupyd-js"
import { useSnackbar } from "@/components/snackbar"
import LandingLayout from "../layout"

export default function SignupPage() {
  // const [showPassword, setShowPassword] = useState(false)

  // const [username, setUsername] = useState("")
  // const [password, setPassword] = useState("")
  const snackbar = useSnackbar()
  const [email, setEmail] = useState("")
  const [agreed, setAgreed] = useState(false)

  const [verificationMailSent, setVerificationMailSent] = useState(false)

  const signupWithEmail = async () => {

    if (!agreed) {
      snackbar("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    const match = email.match(new RegExp(rawEmailRegex))
    if (!match || match.length == 0 || match[0] != email) {
      snackbar(`Email does not seem to be valid`)
      return
    }

    await AuthHandler.sendSignInLink(email)
    setVerificationMailSent(true)
  }

  return (
    <LandingLayout>
      {verificationMailSent ? <SendVerificationMailComponent {...{ email }} /> :
        <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
          <AnimatedCard>
            <Card className="w-full max-w-md border-none shadow-lg">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Join Lupyd</CardTitle>
                <CardDescription>Enter your information to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="" onChange={(e) => setUsername(e.target.value)} value={username} />
            </div> */}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="name@example.com" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                </div>


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
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(e) => setAgreed(e == true)} />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link to="/terms" className="font-medium text-black hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="font-medium text-black hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={signupWithEmail}>Join</Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                  </div>
                </div>

                {/*
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
              </div>
            */}
              </CardContent>

              {/*
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-black hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        */}

            </Card>
          </AnimatedCard>
        </div>
      }
    </LandingLayout>
  )
}



function SendVerificationMailComponent(props: { email: string }) {
  const snackbar = useSnackbar()

  const [lastMailSentTs, setLastMailSentTs] = useState(Date.now())

  const INTERVAL_BETWEEN_RESEND_IN_MS = 1000 * 60 // 1 minute

  const resendMail = async () => {
    if (Date.now() - lastMailSentTs < INTERVAL_BETWEEN_RESEND_IN_MS) {
      snackbar(`Please wait ${secondsLeft} seconds before trying to receive mail`)
      return
    }

    const user = AuthHandler.currentUser().val
    if (user == null) {
      snackbar(`User is not signed up`)
      return
    }

    if (user.emailVerified) {
      snackbar(`User email is already verified`)
      return
    }

    const username = await AuthHandler.getUsername(user)

    if (username != null) {
      snackbar(`User is already assigned username`)
      return
    }

    await AuthHandler.sendSignInLink(props.email)
    setLastMailSentTs(Date.now())
  }

  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((INTERVAL_BETWEEN_RESEND_IN_MS - (Date.now() - lastMailSentTs)) / 1000)))
    }, 1000)
    return () => clearInterval(interval)

  }, [lastMailSentTs])

  return (<>

    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <AnimatedCard>
        <Card className="w-full max-w-md border-none shadow-lg">

          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <CardDescription>
              <p>Retry again in {secondsLeft} seconds</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>An Email with Verification Link has been sent to <b>{props.email}</b>, Click on the link</p>
            <div className="space-y-2">
              <Button onClick={Date.now() - lastMailSentTs < INTERVAL_BETWEEN_RESEND_IN_MS ? undefined : resendMail}>Send Verification Mail Again</Button>
            </div>
          </CardContent>

        </Card>
      </AnimatedCard>
    </div >

  </>)
}
