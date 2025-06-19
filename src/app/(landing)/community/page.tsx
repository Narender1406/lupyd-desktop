import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCard } from "@/components/animated-card"
import { UserPlus, Users, Network } from "lucide-react"
import { Link } from "react-router-dom"

export default function CommunityPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <PageHeader
        title="Community & Connections"
        description="Build meaningful relationships and connect with like-minded individuals on Lupyd's community-focused platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <AnimatedCard delay={0.1}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <UserPlus className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Smart Friend Discovery</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Connect with like-minded individuals using our smart friend discovery algorithms. Find people who share
                your interests and passions.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Users className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Interest-Based Groups</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Join interest-based community groups to share your passions. Engage in discussions, share content, and
                build connections around shared interests.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Network className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Professional Networking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Manage both professional and personal networks with ease. Build your professional presence while
                maintaining separate personal connections.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-100 p-8 rounded-lg">
              <img
                src="/BM.png?height=300&width=500"
                width={500}
                height={300}
                alt="Community interaction"
                className="rounded-lg shadow-md"
              />
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Building Meaningful Connections</h2>
              <p className="text-muted-foreground mb-6">
                Lupyd is designed to foster genuine connections between users. Our platform encourages meaningful
                interactions rather than superficial engagement.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Quality conversations over quantity of connections</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Tools to maintain long-term relationships</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Engagement-focused rather than metrics-focused</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Community guidelines that promote respect and authenticity</span>
                </li>
              </ul>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Community Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Community Events</h3>
              <p className="text-muted-foreground">
                Discover and participate in virtual and in-person events organized by communities. Connect with others
                who share your interests in real-time.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Collaborative Projects</h3>
              <p className="text-muted-foreground">
                Work together on collaborative projects within your communities. Share ideas, contribute content, and
                achieve goals as a team.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Community Challenges</h3>
              <p className="text-muted-foreground">
                Participate in community challenges to engage with others and showcase your skills. Challenges provide a
                fun way to connect and compete.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.4}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Global Communities</h3>
              <p className="text-muted-foreground">
                Connect with communities around the world. Expand your horizons by engaging with diverse perspectives
                and cultures.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <div className="flex justify-center">
        <Link to="/">
          <Button className="bg-black text-white hover:bg-gray-800">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}

