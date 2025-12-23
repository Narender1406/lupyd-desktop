"use client"


import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, MessageSquare, Settings, Zap } from "lucide-react"
import { AnimatedCard } from "@/components/animated-card"
import LandingLayout from "./layout"
import ColorBends from './ColorBends';
import './ColorBends.css'

export default function LandingPage() {

  return (
    <LandingLayout>
      <div className="fixed inset-0 -z-10">
        <ColorBends
          colors={["#000000", "#ffffff", "#808080"]}
          rotation={30}
          speed={0.3}
          scale={1.2}
          frequency={1.4}
          warpStrength={1.2}
          mouseInfluence={0.8}
          parallax={0.6}
          noise={0.08}
          transparent
        />
      </div>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-black">
              Lupyd: The Next Generation Social Platform
            </h1>
            <p className="mx-auto max-w-[700px] text-lg md:text-xl text-black">
              Experience the future of social networking with Lupyd. Connect, share, and collaborate in a secure
              and personalized environment.
            </p>
            <div className="space-x-4">
              <Link to="/">
                <Button className="bg-white text-black border border-gray-300 hover:bg-gray-200">Get Started</Button>
              </Link>

            </div>
          </div>
        </div>
      </section>


      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black">Why Lupyd?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <AnimatedCard delay={0.1}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Revolutionary Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black/80">
                    Lupyd is revolutionizing social connections in the digital age, offering a seamless and
                    engaging experience.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Faster Content Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black/80">
                    Enjoy 87% faster content sharing compared to competitors, making your interactions more efficient.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Privacy-First Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black/80">
                    Experience a privacy-first social networking environment, ensuring your data is protected.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI-Powered Personalization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black/80">
                    Benefit from AI-powered personalization algorithms that tailor your experience to your preferences.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.5}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <img src="/flag.png" alt="Indian Flag" className="h-12 w-12 mb-2" />
                  <CardTitle className="text-xl text-center">Made in India</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">
                    The first ever Encrypted Project Development app developed in India, built with sense of security for global users.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/about/features">
              <Button className="bg-black/20 text-black border border-black/30 hover:bg-black/30">Explore All Features</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Preview Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <AnimatedCard delay={0.1}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <MessageSquare className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center text-black">Encrypted Messaging</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">
                    Enjoy secure, end-to-end encrypted messaging for private conversations.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <Zap className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center text-black">Advanced Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">
                    Discover content tailored to your interests with our advanced content recommendation system.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <Share2 className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center text-black">Multi-Format Sharing</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">Share various content formats seamlessly across the platform.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <Settings className="h-12 w-12 text-black mb-2" />
                  <CardTitle className="text-xl text-center text-black">Customizable Controls</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">Take control of your privacy with customizable settings.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.5}>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg h-full">
                <CardHeader className="pb-2 flex flex-col items-center">
                  <img src="/flag.png" alt="Indian Flag" className="h-12 w-12 mb-2" />
                  <CardTitle className="text-xl text-center">Indian Innovation</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-black/80">Proudly developed in India with cutting-edge security and technology standards.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/about/features">
              <Button className="bg-black/20 text-black border border-black/30 hover:bg-black/30">View All Features</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-white text-black px-3 py-1 text-sm">Join Today</div>
              <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-black">
                Experience the future of social networking
              </h2>
              <Link
                to="/"
                className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black border border-gray-300 shadow transition-colors hover:bg-gray-200"
              >
                Get Started
              </Link>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="inline-block rounded-lg bg-white text-black px-3 py-1 text-sm">Premium Features</div>
              <p className="mx-auto max-w-[700px] text-black md:text-xl/relaxed">
                Fully managed infrastructure designed to scale dynamically with your network, a global edge to ensure
                your experience is fast, and the tools to monitor every aspect of your social presence.
              </p>
              <Link
                to="#"
                className="inline-flex h-9 items-center justify-center rounded-md border border-black bg-transparent px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black/10"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}