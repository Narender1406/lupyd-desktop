import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCard } from "@/components/animated-card"
import { Shield, Settings, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import LandingLayout from "../layout"

export default function PrivacyPage() {
  return (
    <LandingLayout>
      <div className="container py-12 md:py-24 lg:py-32">
        <PageHeader
          title="Privacy & Security"
          description="At Lupyd, we prioritize your privacy and security with advanced protection mechanisms and user-controlled settings."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <AnimatedCard delay={0.1}>
            <Card className="bg-white border-none shadow-md h-full">
              <CardHeader className="pb-2 flex flex-col items-center">
                <Shield className="h-12 w-12 text-black mb-2" />
                <CardTitle className="text-xl text-center">Advanced Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Utilize advanced data protection mechanisms to secure your information. Our multi-layered security
                  approach keeps your data safe.
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <Card className="bg-white border-none shadow-md h-full">
              <CardHeader className="pb-2 flex flex-col items-center">
                <Settings className="h-12 w-12 text-black mb-2" />
                <CardTitle className="text-xl text-center">User-Controlled Sharing</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Control your data sharing preferences with our user-centric settings. You decide what information is
                  shared and with whom.
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <Card className="bg-white border-none shadow-md h-full">
              <CardHeader className="pb-2 flex flex-col items-center">
                <Eye className="h-12 w-12 text-black mb-2" />
                <CardTitle className="text-xl text-center">Anonymous Browsing</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Browse anonymously with our enhanced privacy options. Explore content without leaving a digital
                  footprint when you choose.
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Privacy Commitment</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-muted-foreground mb-6">
              At Lupyd, we believe privacy is a fundamental right. Our platform is built with privacy at its core, not as
              an afterthought. We are committed to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedCard delay={0.1}>
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    We are clear about what data we collect and how we use it. Our privacy policy is written in plain
                    language, not legal jargon.
                  </p>
                </div>
              </AnimatedCard>
              <AnimatedCard delay={0.2}>
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold mb-2">User Control</h3>
                  <p className="text-sm text-muted-foreground">
                    You have complete control over your data. We provide easy-to-use tools to manage your privacy settings
                    and data.
                  </p>
                </div>
              </AnimatedCard>
              <AnimatedCard delay={0.3}>
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold mb-2">Data Minimization</h3>
                  <p className="text-sm text-muted-foreground">
                    We only collect the data necessary to provide our services. We don't collect data for the sake of
                    having more information.
                  </p>
                </div>
              </AnimatedCard>
              <AnimatedCard delay={0.4}>
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold mb-2">Security First</h3>
                  <p className="text-sm text-muted-foreground">
                    We implement the latest security measures to protect your data from unauthorized access and breaches.
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedCard delay={0.1}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                <p className="text-muted-foreground">
                  All your messages and sensitive content are protected with end-to-end encryption, ensuring only intended
                  recipients can access them.
                </p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-muted-foreground">
                  Add an extra layer of security to your account with two-factor authentication, preventing unauthorized
                  access even if your password is compromised.
                </p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Regular Security Audits</h3>
                <p className="text-muted-foreground">
                  We conduct regular security audits and vulnerability assessments to identify and address potential
                  security issues before they become problems.
                </p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Data Breach Notifications</h3>
                <p className="text-muted-foreground">
                  In the unlikely event of a data breach, we commit to promptly notifying affected users and taking
                  immediate steps to mitigate any potential harm.
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

