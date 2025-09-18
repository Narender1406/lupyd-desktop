"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function ProfileSettings() {
  const navigate = useNavigate()

  return (
    <div>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  )
}
