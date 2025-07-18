import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: "increase" | "decrease" | "neutral"
  }
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <Badge
            variant={change.type === "increase" ? "default" : change.type === "decrease" ? "destructive" : "secondary"}
            className="mt-2"
          >
            {change.value}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
