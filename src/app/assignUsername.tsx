import { useSnackbar } from "@/components/snackbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { getAuthHandler, isValidUsername } from "lupyd-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AssignUsernamePage() {

  const auth = useAuth()
  const [username, setUsername] = useState("")

  const [errorText, setErrorText] = useState("")

  const navigate = useNavigate()

  const snackbar = useSnackbar()

  const onSubmit = () => {
    if (!isValidUsername(username)) {
      setErrorText("Invalid username, should be greater than 2 characters and less than 30 characters and should only contain a-zA-Z0-9_")
      return;
    }

    getAuthHandler()!.assignUsername(username).then(() => {
      navigate("/dashboard", { replace: true })
    }).catch((err) => {
      console.error(err)
      snackbar("Username may have already exist")
    })
  }

  useEffect(() => {
    if (auth.username) {
      navigate("/dashboard", { replace: true })
    }
  }, [auth])


  return (<div>

    <Input value={username} onChange={(e) => { setUsername(e.target.value) }} onKeyDown={(e) => {
      if (e.key === 'Enter') {
        onSubmit()
      }
    }}></Input>
    <Button onClick={onSubmit}>Assign</Button>
    <p>{errorText}</p>

  </div>)

}
