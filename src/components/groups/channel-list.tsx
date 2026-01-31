import { cn } from "@/lib/utils"
import type { protos } from "firefly-client-js"
import { Hash, Volume2 } from "lucide-react"

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
            <div className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              {cat === 1 ? "Text Channels" : cat === 2 ? "Voice Channels" : `Category ${cat}`}
            </div>

            <div className="space-y-1">
              {list.map((ch) => {
                const isActive = ch.id === selectedId
                const Icon = ch.type === 2 ? Volume2 : Hash

                return (
                  <button
                    key={ch.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition text-sm",
                      "hover:bg-gray-200 dark:hover:bg-zinc-700",
                      isActive && "bg-gray-200 dark:bg-zinc-700 text-black dark:text-white"
                    )}
                    onClick={() => onSelect?.(ch.id)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{ch.name}</span>
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
