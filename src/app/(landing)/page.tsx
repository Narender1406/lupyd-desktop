"use client"


import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, MessageSquare, Settings, Zap } from "lucide-react"
import { AnimatedCard } from "@/components/animated-card"

export default function LandingPage() {

  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Lupyd: The Next Generation Social Platform
            </h1>
            <p className="mx-auto max-w-[700px] text-lg md:text-xl">
              Experience the future of social networking with Lupyd. Connect, share, and collaborate in a secure
              and personalized environment.
            </p>
            <div className="space-x-4">
              <Link to="/dashboard">
                <Button className="bg-white text-black hover:bg-gray-200">Get Started</Button>
              </Link>

            </div>
          </div>
        </div>
      </section>


      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Lupyd?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedCard delay={0.1}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Revolutionary Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Lupyd is revolutionizing social connections in the digital age, offering a seamless and
                    engaging experience.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Faster Content Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Enjoy 87% faster content sharing compared to competitors, making your interactions more efficient.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Privacy-First Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Experience a privacy-first social networking environment, ensuring your data is protected.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI-Powered Personalization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Benefit from AI-powered personalization algorithms that tailor your experience to your preferences.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/features">
              <Button className="bg-black text-white hover:bg-gray-800">Explore All Features</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Preview Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedCard delay={0.1}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <MessageSquare className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center">Encrypted Messaging</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Enjoy secure, end-to-end encrypted messaging for private conversations.
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
                    Discover content tailored to your interests with our advanced content recommendation system.
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
                  <p className="text-muted-foreground">Share various content formats seamlessly across the platform.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <Card className="bg-white border-none shadow-md h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <Settings className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center">Customizable Controls</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">Take control of your privacy with customizable settings.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/features">
              <Button className="bg-black text-white hover:bg-gray-800">View All Features</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-white text-black px-3 py-1 text-sm">Join Today</div>
              <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                Experience the future of social networking
              </h2>
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow transition-colors hover:bg-gray-200"
              >
                Get Started
              </Link>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="inline-block rounded-lg bg-white text-black px-3 py-1 text-sm">Premium Features</div>
              <p className="mx-auto max-w-[700px] text-white md:text-xl/relaxed">
                Fully managed infrastructure designed to scale dynamically with your network, a global edge to ensure
                your experience is fast, and the tools to monitor every aspect of your social presence.
              </p>
              <Link
                to="#"
                className="inline-flex h-9 items-center justify-center rounded-md border border-white bg-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/10"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

