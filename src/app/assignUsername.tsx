import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ConflictStatusError, isValidUsername, NotAuthorizedError, ServerInternalError } from "lupyd-js";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LandingLayout from "./(landing)/layout";
import { AnimatedCard } from "@/components/animated-card";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useApiService } from "@/context/apiService";


export default function AssignUsernamePage() {

  const auth = useAuth()
  const { api } = useApiService()
  const [username, setUsername] = useState("")

  const [usernameBeingAssigned, setUsernameBeingAssigned] = useState(false)

  const [bottomText, setBottomText] = useState("")

  const navigate = useNavigate()


  const navigateToNext = () => {
    navigate("/", { replace: true })
  }


  const onSubmit = () => {

    if (usernameBeingAssigned) {
      return
    }

    if (!auth.user) {
      auth.login()
      setBottomText("Signin Attempt Failed")
      return
    }


    if (!isValidUsername(username)) {
      setBottomText("Invalid username, should be greater than 2 characters and less than 30 characters and should only contain a-zA-Z0-9_")
      return;
    }


    setBottomText("Username is being assigned...");

    setUsernameBeingAssigned(true)
    api.assignUsername(username).then(async () => {
      await auth.getToken(true)
      navigateToNext()
    }).catch((err) => {
      console.error(err)
      if (err instanceof ConflictStatusError) {
        toast({ title: "Username may have already exist" })
        setBottomText("Username may have already exist")
      } else if (err instanceof ServerInternalError) {
        toast({ title: "Something went wrong" })
        setBottomText("Something went wrong, try again later")
      } else if (err instanceof NotAuthorizedError) {
        toast({ title: "You are not authorized to do this operation" })
        setBottomText("Try again later")
      } else {
        toast({ title: "Something went wrong" })
      }
    }).finally(() => setUsernameBeingAssigned(false))
  }



  useEffect(() => {
    if (auth.username) {
      navigateToNext()
      return
    }
  }, [auth])


  // useEffect(() => {
  //   const code = params.get("code")
  //   if (code) {
  //     setBottomText("")
  //     console.log(`Handling redirected callback ${params}`)
  //     // auth.handleRedirectCallback().then(state => {
  //     //   if ("targetPath" in state && typeof state["targetPath"] == "string") {
  //     //     setTargetPath(state["targetPath"])
  //     //   }
  //     // }).catch(console.error)
  //   } else {
  //     console.log(`No redirection code`)
  //   }

  // }, [])


  return (
    <LandingLayout>

      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">

        <div className="space-y-2">
          <AnimatedCard>
            <Card>
              <CardContent>
                <Label htmlFor="username">
                  Username
                </Label>

                <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value) }} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmit()
                  }
                }}></Input>
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={onSubmit}>Assign</Button>
                <p>{bottomText}</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>

    </LandingLayout>
  )

}
