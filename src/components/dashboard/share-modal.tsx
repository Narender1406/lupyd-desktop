"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Copy, Twitter, Facebook, Linkedin, Mail, Link2, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ShareModalProps {
  title: string
  url: string
  children?: React.ReactNode
}

export function ShareModal({ title, url, children }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
    )
    setOpen(false)
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
    setOpen(false)
  }

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    setOpen(false)
  }

  const shareViaEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this post: ${url}`)}`,
      "_blank",
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="link">Copy Link</TabsTrigger>
          </TabsList>
          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                onClick={shareViaTwitter}
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                onClick={shareViaFacebook}
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                onClick={shareViaLinkedIn}
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 h-12" onClick={shareViaEmail}>
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="link" className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Post Link</span>
                </div>
                <div className="flex items-center">
                  <Input value={url} readOnly className="flex-1" />
                  <Button size="sm" className="ml-2 bg-black text-white hover:bg-gray-800" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
