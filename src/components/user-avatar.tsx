import React, { useEffect, useState } from "react";

import { CDN_STORAGE } from "lupyd-js"


import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import LazyLoad from "react-lazyload";


export function UserAvatar(props: { username: string }) {
  // const context = useUserImage()

  const src = `${CDN_STORAGE}/users/${props.username}`

  // const [src, setSrc] = useState<string | null>(null)
  // useEffect(() => {
  //   if (props.username == "") return

  //   if (context.has(props.username)) {
  //     setSrc(context.get(props.username)!)
  //   } else {
  //     fetch(`${CDN_STORAGE}/users/${props.username}`).then(async response => {
  //       if (response.status == 200) {

  //         const url = URL.createObjectURL(await response.blob())

  //         setSrc(url)
  //         context.set(props.username, url)

  //       } else if (response.status == 404) {
  //         context.set(props.username, null)
  //         setSrc(null)
  //       }
  //     })
  //   }

  // }, [])

  const fallback = <AvatarFallback>{props.username == "" ? "U" : props.username[0].toUpperCase()}</AvatarFallback>

  return (<>
    <LazyLoad placeholder={<Avatar> fallback</Avatar>}>
      <Avatar>
        <AvatarImage src={src ?? ""} alt={props.username} loading="lazy" />
        {fallback}
      </Avatar>
    </LazyLoad>
  </>
  )


}
