import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCard } from "@/components/animated-card"
import { Share2, MessageSquare, Settings, Zap, Users, Lock } from "lucide-react"
import {Link} from "react-router-dom"
import LandingLayout from "../layout"

export default function FeaturesPage() {
  return (
    <LandingLayout>
    <div className="container py-12 md:py-24 lg:py-32">
      <PageHeader
        title="Key Features"
        description="Discover all the powerful features that make Lupyd the next generation social platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <AnimatedCard delay={0.1}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <MessageSquare className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Encrypted Messaging</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Enjoy secure, end-to-end encrypted messaging for private conversations. Our advanced encryption ensures
                your messages remain private and secure.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Zap className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Advanced Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Discover content tailored to your interests with our advanced content recommendation system. Our AI
                algorithms learn your preferences to deliver relevant content.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Share2 className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Multi-Format Sharing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Share various content formats seamlessly across the platform. From images and videos to documents and
                links, share what matters to you.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Settings className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">First Ever Customizable Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Take control of your privacy with customizable settings. Manage who sees your content and how you
                interact with others on the platform.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Users className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Group Collaboration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Collaborate with friends, family, or colleagues in dedicated group spaces. Share ideas, plan events, and
                stay connected.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.6}>
          <Card className="bg-white border-none shadow-md h-full">
            <CardHeader className="pb-2 flex flex-col items-center">
              <Lock className="h-12 w-12 text-black mb-2" />
              <CardTitle className="text-xl text-center">Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Advanced privacy controls give you complete authority over your data and who can access your
                information.
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Additional Feature Sections - Add your content here */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Advanced Security Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-muted-foreground">
                Add an extra layer of security to your account with two-factor authentication. Protect your personal
                information and ensure only you can access your account.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Biometric Login</h3>
              <p className="text-muted-foreground">
                Use your fingerprint or facial recognition to quickly and securely access your account. Biometric
                authentication provides both convenience and enhanced security.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Content Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Content Scheduling</h3>
              <p className="text-muted-foreground">
                Plan and schedule your content in advance to maintain a consistent presence. Our scheduling tools help
                you optimize posting times for maximum engagement.
              </p>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Content Library</h3>
              <p className="text-muted-foreground">
                Organize and manage all your content in one centralized library. Easily search, filter, and reuse your
                content across different channels and campaigns.
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

