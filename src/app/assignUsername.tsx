import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ConflictStatusError, getPayloadFromAccessToken, isValidUsername, NotAuthorizedError, ServerInternalError } from "lupyd-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./(landing)/layout";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useApiService } from "@/context/apiService";


export default function AssignUsernamePage() {

  const auth = useAuth()
  const { api } = useApiService()
  const [inputUsername, setInputUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorText, setErrorText] = useState("")
  const navigate = useNavigate()

  const goToFeed = () => navigate("/", { replace: true })

  // If the user already has a username set in auth context (e.g. returning user
  // whose token already contains the uname claim, or recovery after a conflict),
  // redirect immediately to the feed.
  //
  // Depend ONLY on auth.username — not the whole auth object — to avoid firing
  // on unrelated context updates (getToken / handleRedirectCallback ref changes).
  useEffect(() => {
    if (auth.username) {
      goToFeed()
    }
  }, [auth.username])


  const onSubmit = async () => {
    if (submitting) return

    const token = await auth.getToken()
    if (!token) {
      auth.login()
      return
    }

    if (!isValidUsername(inputUsername)) {
      setErrorText("Invalid username — must be 3–30 characters, only a-z A-Z 0-9 _")
      return
    }

    setErrorText("")
    setSubmitting(true)

    const ALLOW_CHAT_SETTING = 1

    try {
      await api.assignUsername(inputUsername, new Uint8Array(), ALLOW_CHAT_SETTING)

      // Success — force-refresh the token so auth.username is set from the new
      // uname claim before navigating. The useEffect above will fire and redirect.
      await auth.getToken(true)
      goToFeed()

    } catch (err) {
      console.error(err)

      if (err instanceof ConflictStatusError) {
        // ConflictStatusError has two possible causes:
        //
        // A) users_uid_key violated: The user's Auth0 UID already has a row in the
        //    DB from a previous (partially-completed) registration. Their username
        //    IS set — the response was just lost (timeout / network error).
        //
        // B) users_pkey violated: The uname they chose is taken by a different user.
        //
        // We distinguish by force-refreshing the token. Auth0's backend action reads
        // from the DB and includes `uname` in the JWT if the user is registered.
        // • If the fresh token contains uname → case A → redirect to feed.
        // • If the fresh token has no uname → case B → username is genuinely taken.
        try {
          const freshToken = await auth.getToken(true)
          const payload = freshToken ? getPayloadFromAccessToken(freshToken) : null

          if (payload?.uname) {
            // Case A: user was already registered → auth.username will be set
            // by getToken(true) → the useEffect above fires → redirect to feed.
            goToFeed()
          } else {
            // Case B: username genuinely taken by someone else.
            setErrorText("That username is already taken — please choose a different one.")
            toast({ title: "Username taken", description: "Please choose a different username." })
          }
        } catch (refreshErr) {
          console.error("Token refresh failed after conflict:", refreshErr)
          setErrorText("Could not verify username status — please try again.")
        }

      } else if (err instanceof ServerInternalError) {
        setErrorText("Server error — please try again later.")
        toast({ title: "Server error" })

      } else if (err instanceof NotAuthorizedError) {
        setErrorText("Session expired — please sign in again.")
        toast({ title: "Not authorized" })
        auth.login()

      } else {
        setErrorText("Something went wrong — please try again.")
        toast({ title: "Something went wrong" })
      }

    } finally {
      setSubmitting(false)
    }
  }


  return (
    <LandingLayout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <div className="space-y-2">
          <div>
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Label htmlFor="username">Choose a username</Label>
                <Input
                  id="username"
                  value={inputUsername}
                  placeholder="e.g. cool_user_123"
                  disabled={submitting}
                  onChange={(e) => setInputUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
                />
                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={onSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Assigning..." : "Assign username"}
                </Button>
                {errorText && (
                  <p className="text-sm text-red-500">{errorText}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}
