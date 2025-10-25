import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCard } from "@/components/animated-card"
import { Zap, Smartphone, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import LandingLayout from "../layout"

export default function ExperiencePage() {
  return (
    <LandingLayout>
    <div className="container py-12 md:py-24 lg:py-32">
      <PageHeader
        title="User Experience"
        description="Discover how Lupyd delivers an exceptional user experience through intuitive design and seamless functionality."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <AnimatedCard delay={0.1}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Zap className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Intuitive Interface</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Navigate with ease using our intuitive, minimalist interface design. Our platform is designed to be
                user-friendly and accessible to everyone.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Smartphone className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Seamless Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Experience seamless mobile and desktop integration for on-the-go access. Stay connected across all your
                devices with synchronized content and notifications.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Clock className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Instant Loading</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Enjoy instant content loading for a smooth and responsive experience. Our platform is optimized for
                speed, ensuring you never have to wait.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedCard delay={0.1}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Designed for Everyone</h2>
              <p className="text-muted-foreground mb-6">
                Our platform is designed with accessibility in mind, ensuring that everyone can enjoy a seamless social
                networking experience regardless of their abilities or technical expertise.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Accessibility features </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Customizable text sizes and contrast settings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Voice commands and screen reader compatibility</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Simplified navigation for all users</span>
                </li>
              </ul>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div className="bg-gray-100 p-8 rounded-lg">
              <img
                src="/DD22.png?height=300&width=500"
                width={500}
                height={300}
                alt="User interface example"
                className="rounded-lg shadow-md"
              />
            </div>
          </AnimatedCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Personalized Experience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Custom Themes(soon)</h3>
              <p className="text-muted-foreground">
                Personalize your experience with custom themes and layouts. Choose from a variety of color schemes and
                design options to make the platform your own.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Content Preferences</h3>
              <p className="text-muted-foreground">
                Set your content preferences to see more of what you love. Our AI-powered algorithms learn from your
                interactions to deliver a personalized feed.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Notification Controls</h3>
              <p className="text-muted-foreground">
                Take control of your notifications to stay informed without feeling overwhelmed. Customize when and how
                you receive alerts about activity on the platform.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.4}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Language Settings</h3>
              <p className="text-muted-foreground">
                Use the platform in your preferred language. We support multiple languages to ensure a comfortable
                experience for users around the world.
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

