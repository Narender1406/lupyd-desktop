import { useSnackbar } from "@/components/snackbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { getAuthHandler, isValidUsername } from "lupyd-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./(landing)/layout";
import { AnimatedCard } from "@/components/animated-card";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";


export default function AssignUsernamePage() {

  const auth = useAuth()
  const [username, setUsername] = useState("")

  const [bottomText, setBottomText] = useState("")

  const navigate = useNavigate()

  const snackbar = useSnackbar()

  const onSubmit = () => {
    if (!isValidUsername(username)) {
      setBottomText("Invalid username, should be greater than 2 characters and less than 30 characters and should only contain a-zA-Z0-9_")
      return;
    }


    setBottomText("Username is being assigned...");
    getAuthHandler()!.assignUsername(username).then(() => {
      navigate("/", { replace: true })
    }).catch((err) => {
      console.error(err)
      snackbar("Username may have already exist")
      setBottomText("Username may have already exist")
    })
  }

  useEffect(() => {
    if (auth.username) {
      navigate("/", { replace: true })
    }
  }, [auth])


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
