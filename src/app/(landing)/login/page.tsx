"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard } from "@/components/animated-card"
import { Eye, EyeOff, Github, Twitter } from "lucide-react"
import { AuthHandler, rawEmailRegex } from "lupyd-js"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useNavigate()

  const login = () => {
    console.log(`Logging in`)

    const match = email.match(new RegExp(rawEmailRegex))
    if (!match || match.length == 0 || match[0] == email) {
      console.warn(`Email is not valid`)
      return
    }

    if (password.length == 0) {
      console.warn(`Password can't be empty`)
      return
    }
    AuthHandler.signInWithPassword(email, password).then(() => {
      console.warn(`Going to homepage /dashboard`)
      router("/dashboard", { replace: true })
    }).catch((err) => console.error(`Login failed `, err))
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <AnimatedCard>
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-black transition-colors">
                  Forgot password?
                </Link>
              </div>
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
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={login}>Sign In</Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signin" className="font-medium text-black hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-4 hover:text-black">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-black">
                Privacy Policy
              </Link>
              .
            </div>
          </CardFooter>
        </Card>
      </AnimatedCard>
    </div>
  )
}

