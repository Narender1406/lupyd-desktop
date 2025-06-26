import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCard } from "@/components/animated-card"
import { DollarSign, BarChart, Activity, Palette, Video, Calendar } from "lucide-react"
import {Link} from "react-router-dom"
import LandingLayout from "../layout"

export default function CreatorToolsPage() {
  return (
    <LandingLayout>
    <div className="container py-12 md:py-24 lg:py-32">
      <PageHeader
        title="Creator Tools"
        description="Empower your creative journey with Lupyd's comprehensive suite of tools designed for content creators."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <AnimatedCard delay={0.1}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <DollarSign className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Monetization</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Unlock opportunities for monetization on the platform. Turn your passion into income with our
                creator-friendly monetization tools.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <BarChart className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Utilize an advanced analytics dashboard to track your content's performance. Gain insights to optimize
                your strategy and grow your audience.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Activity className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Monitor your content's performance and audience engagement metrics. Understand what resonates with your
                audience to create more impactful content.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedCard delay={0.3}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Content Creation Suite</h2>
              <p className="text-muted-foreground mb-6">
                Our comprehensive content creation tools help you produce high-quality content that stands out. From
                ideation to publication, we support your creative process.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Simple uploading features</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Content inspiration resources</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Collaboration features for team projects</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>AI-powered content suggestions and improvements</span>
                </li>
              </ul>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-100 p-8 rounded-lg">
              <img
                src="/CMC.png?height=300&width=500"
                width={500}
                height={300}
                alt="Content creation tools"
                className="rounded-lg shadow-md"
              />
            </div>
          </AnimatedCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Creator Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Design Tools
              </h3>
              <p className="text-muted-foreground">
                Create stunning visuals with our intuitive design tools. Access templates, graphics, and editing
                features to make your content visually appealing.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Video Creation
              </h3>
              <p className="text-muted-foreground">
                Create high quality videos and increase your engagement with the right audience.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Content Calendar
              </h3>
              <p className="text-muted-foreground">
                Plan and schedule your content with our content calendar. Stay organized and maintain a consistent
                posting schedule to grow your audience.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.4}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Performance Analytics
              </h3>
              <p className="text-muted-foreground">
                Gain deep insights into your content performance with detailed analytics. Track engagement, reach, and
                conversion metrics to refine your strategy.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Monetization Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg h-full">
              <h3 className="text-xl font-semibold mb-2">Creator Fund(soon)</h3>
              <p className="text-muted-foreground">
                Access our Creator Fund to receive financial support based on your content performance and audience
                engagement. Reward your creativity and hard work.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg h-full">
              <h3 className="text-xl font-semibold mb-2">Subscription Model</h3>
              <p className="text-muted-foreground">
                Offer premium content to subscribers who pay a monthly fee. Build a steady income stream while providing
                exclusive value to your most dedicated followers.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div className="bg-gray-50 p-6 rounded-lg h-full">
              <h3 className="text-xl font-semibold mb-2">Brand Partnerships</h3>
              <p className="text-muted-foreground">
                Connect with brands for sponsored content opportunities. Our platform makes it easy to find and
                collaborate with brands that align with your values.
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
  </LandingLayout>
  )
}

