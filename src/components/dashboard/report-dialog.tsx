"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApiService } from "@/context/apiService"
import { useAuth } from "@/context/auth-context"
import { PostProtos } from "lupyd-js"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    postId: Uint8Array
    title?: string
}

export function ReportDialog({ open, onOpenChange, postId, title }: ReportDialogProps) {
    const [severity, setSeverity] = useState<string>("1")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { apiUrl } = useApiService()
    const auth = useAuth()

    const handleSubmit = async () => {
        console.log("handleSubmit called")
        if (!permissionCheck()) return

        setIsSubmitting(true)

        try {
            let token: string | undefined = undefined

            try {
                token = await auth.getToken()
                console.log("Token received:", token ? "exists" : "null/undefined")
            } catch (authError) {
                console.log("Auth error caught:", authError)
            }

            if (!token) {
                console.log("No token - showing auth required toast")
                toast({
                    title: "Authentication required",
                    description: "Please sign in to report posts.",
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            console.log("Submitting report with token")

            // Construct the protobuf message directly to utilize the severity field
            // which is missing from the library helper function
            const body = new Uint8Array(
                PostProtos.PostReport.encode(
                    PostProtos.PostReport.create({
                        postId: postId,
                        description: description,
                        sevirity: parseInt(severity)
                    })
                ).finish()
            )

            const response = await fetch(`${apiUrl}/report`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: body
            })

            if (response.ok) {
                toast({
                    title: "Report submitted",
                    description: "Thank you for helping keep our community safe.",
                })
                onOpenChange(false)
                setDescription("")
                setSeverity("1")
            } else {
                const errorText = await response.text()
                throw new Error(errorText || "Failed to submit report")
            }
        } catch (error) {
            console.error("Report error:", error)
            toast({
                title: "Error submitting report",
                description: "There was a problem submitting your report. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const permissionCheck = () => {
        if (!description.trim()) {
            toast({
                title: "Description required",
                description: "Please provide a brief description of the issue.",
                variant: "destructive",
            })
            return false
        }
        return true
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Post</DialogTitle>
                    <DialogDescription>
                        Help us understand what's wrong with this post. {title ? `"${title}"` : ""}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="severity">Reason</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                            <SelectTrigger id="severity">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Spam / Low Quality</SelectItem>
                                <SelectItem value="2">Inappropriate / NSFW</SelectItem>
                                <SelectItem value="3">Harassment / Hate Speech</SelectItem>
                                <SelectItem value="4">Dangerous / Illegal Content</SelectItem>
                                <SelectItem value="5">Child Sexual Abuse Material</SelectItem>
                                <SelectItem value="6">Other</SelectItem>

                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Details</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide specific details about why you are reporting this post..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
