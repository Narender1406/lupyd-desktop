"use client"

import { Hash, Lock, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

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
  channels: ChannelListItem[]
  filter?: string
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const grouped = channels.reduce<Record<string, ChannelListItem[]>>((acc, ch) => {
    const key = ch.category || "Text"
    acc[key] = acc[key] || []
    acc[key].push(ch)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <div className="py-2">
      {categories.map((cat) => {
        const list = grouped[cat]
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
                    <div className="flex items-center gap-2 truncate">
                      {ch.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                      <span className="truncate">{ch.name}</span>
                    </div>

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
