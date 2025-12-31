"use client"

import { cn } from "@/lib/utils"
import type { protos } from "firefly-client-js"
import { MoreVertical } from "lucide-react"

export interface ChannelListItem {
  id: string
  name: string
  isPrivate?: boolean
  category?: string
}

export function ChannelList({
  channels,
  filter,
  selectedId,
  onSelect,
}: {
  channels: protos.FireflyGroupChannel[]
  filter?: string
  selectedId?: number
  onSelect?: (id: number) => void
}) {
  // const grouped = channels.reduce<Record<number, protos.FireflyGroupChannel[]>>((acc, ch) => {
  //   const key = ch.type
  //   acc[key] = acc[key] || []
  //   acc[key].push(ch)
  //   return acc
  // }, {})

  const grouped = new Map<number, protos.FireflyGroupChannel[]>()


  for (const ch of channels) {
    grouped.set(ch.type, grouped.get(ch.type) || [])
    grouped.get(ch.type)!.push(ch)
  }


  return (
    <div className="py-2">
      {Array.from(grouped.keys()).map((cat) => {
        const list = grouped.get(cat)!
          .filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase()))
          .sort((a, b) => a.name.localeCompare(b.name))
        if (!list.length) return null
        return (
          <div key={cat} className="px-3 pb-2">
            <div className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              {cat}
            </div>

            <div className="space-y-1">
              {list.map((ch) => {
                const isActive = ch.id === selectedId

                return (
                  <button
                    key={ch.id}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition",
                      "hover:bg-gray-200 dark:hover:bg-zinc-800",       // hover fix
                      isActive && "bg-gray-200 dark:bg-zinc-800"         // active fix
                    )}
                    onClick={() => onSelect?.(ch.id)}
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
