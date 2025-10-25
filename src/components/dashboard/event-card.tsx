import { AnimatedCard } from "@/components/animated-card"

export interface EventCardProps {
  id: string
  title: string
  date: {
    month: string
    day: string
  }
  location: string
  time: string
  delay?: number
}

export function EventCard({ title, date, location, time, delay = 0 }: EventCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="flex items-start space-x-3 mb-3">
        <div className="bg-gray-100 rounded p-2 text-center min-w-[50px]">
          <p className="text-xs font-medium">{date.month}</p>
          <p className="text-lg font-bold">{date.day}</p>
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {location} • {time}
          </p>
        </div>
      </div>
    </AnimatedCard>
  )
}

