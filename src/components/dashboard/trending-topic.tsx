import { AnimatedCard } from "@/components/animated-card"
import { Utils } from "lupyd-js"
import { Link } from "react-router-dom"


export function TrendingTopic({ name, total, delay = 0 }: { name: string, total: number, delay: number }) {

  return (
    <AnimatedCard delay={delay}>
      <Link to={`/dashboard/discover?hashtag=${name}`}>
        <div className="mb-3">
          <p className="text-sm font-medium">#{name}</p>
          <p className="text-xs text-muted-foreground">{Utils.formatNumber(total)} posts</p>
        </div>
      </Link>
    </AnimatedCard>
  )
}

