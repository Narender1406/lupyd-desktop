"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Zap, Shield, Crown, Sparkles, ArrowRight, Gift, Clock, Heart } from "lucide-react"


const plans = [
  {
    

    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    badge: null,
    features: [
      
      "Basic profile customization",
      "Standard messaging",
      "Community access",
      "Mobile app access",
      "Basic analytics",
    ],
    limitations: ["Limited storage (1GB)", "Standard support", "Basic themes only"],
    cta: "Current Plan",
    popular: false,
    color: "border-gray-200",
  },
  {
    name: "CONTENT CREATOR PACK",
    price: 9.99,
    period: "month",
    description: "For creators and professionals",
    badge: "Most Popular",
    features: [
      "Unlimited posts",
      "Advanced profile customization",
      "Priority messaging",
      "Exclusive communities",
      "Advanced analytics",
      "Custom themes",
      "Video uploads (up to 4K)",
      "Story highlights",
      "Scheduled posting",
      "Priority support",
    ],
    limitations: ["50GB storage", "Up to 5 team members"],
    cta: "Upgrade to Pro",
    popular: true,
    color: "border-black",
  },
  { 
    name: "BUSINESS PACK",
    price: 19.9,
    period: "month",
    description: "For businesses and power users",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Advanced team collaboration",
      "White-label options",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced security features",
      "Custom analytics dashboard",
      "24/7 phone support",
      "Early access to features",
    ],
    limitations: [],
    cta: "Go Premium",
    popular: false,
    color: "border-gray-800",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    content: "Lupyd Pro transformed my content strategy. The analytics alone are worth the subscription!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    content: "The team collaboration features in Premium have streamlined our entire social media workflow.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emma Rodriguez",
    role: "Influencer",
    content: "I love the custom themes and advanced posting features. My engagement has increased by 40%!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your billing period.",
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 14-day free trial for both Pro and Premium plans. No credit card required to start.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer:
      "Your data is always safe. If you exceed the limits of a lower plan, you'll have read-only access until you upgrade again.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students get 50% off Pro and Premium plans with a valid student email address.",
  },
  {
    question: "Can I change plans later?",
    answer: "You can upgrade or downgrade at any time. Changes take effect immediately with prorated billing.",
  },
]

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getPrice = (price: number) => {
    if (price === 0) return "Free"
    const yearlyPrice = billingPeriod === "yearly" ? price * 10 : price * 12
    const displayPrice = billingPeriod === "yearly" ? price * 10 : price
    return billingPeriod === "yearly" ? `$${displayPrice}/year` : `$${price}/month`
  }

  const getSavings = (price: number) => {
    if (price === 0 || billingPeriod === "monthly") return null
    const monthlyCost = price * 12
    const yearlyCost = price * 10
    const savings = monthlyCost - yearlyCost
    return `Save $${savings}/year`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Unlock Your Full Potential</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of creators, professionals, and businesses who trust Lupyd to grow their online presence.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-full p-1 mb-8">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly" ? "bg-white text-black" : "text-white hover:text-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === "yearly" ? "bg-white text-black" : "text-white hover:text-gray-300"
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative bg-white shadow-xl ${plan.color} ${
                plan.popular ? "scale-105 shadow-2xl" : ""
              } transition-all hover:shadow-2xl`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-black text-white px-4 py-1">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {plan.name === "Free" && <Heart className="h-8 w-8" />}
                  {plan.name === "Pro" && <Zap className="h-8 w-8" />}
                  {plan.name === "Premium" && <Crown className="h-8 w-8" />}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                <div className="mt-4">
                  <div className="text-4xl font-bold">{getPrice(plan.price)}</div>
                  {getSavings(plan.price) && (
                    <div className="text-green-600 text-sm font-medium">{getSavings(plan.price)}</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="h-5 w-5 mt-0.5 flex-shrink-0">
                          <div className="h-1 w-3 bg-gray-300 rounded"></div>
                        </div>
                        <span className="text-xs text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {plan.name === "Free" ? (
                  <Button className="w-full bg-gray-100 text-gray-500 cursor-not-allowed" disabled>
                    {plan.cta}
                  </Button>
                ) : (
                  <Link to={`/subscription/checkout?plan&price=${plan.name.toLowerCase()}`}>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-black text-white hover:bg-gray-800"
                          : "border border-black bg-white text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {plan.name !== "Free" && (
                  <p className="text-xs text-center text-gray-500">14-day free trial • No credit card required</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Upgrade?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how our plans compare and discover the features that will help you grow faster.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto mb-4" />
              <CardTitle>Grow Your Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced analytics and insights help you understand your audience and create content that resonates.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <CardTitle>Professional Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access to premium features like scheduled posting, custom themes, and priority support.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <CardTitle>Save Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automation tools and team collaboration features help you manage your presence more efficiently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-gray-600">See what our community has to say about Lupyd</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about our plans</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="cursor-pointer"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{faq.question}</h3>
                  <div className={`transform transition-transform ${expandedFaq === index ? "rotate-45" : ""}`}>
                    <div className="w-4 h-4 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-black"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-0.5 h-3 bg-black"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expandedFaq === index && (
                <CardContent className="pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Gift className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">14-Day Money-Back Guarantee</h2>
            <p className="text-gray-300 mb-8">
              Try Lupyd risk-free. If you're not completely satisfied within 30 days, we'll refund your money, no
              questions asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscription/checkout?plan=pro">
                <Button className="bg-white text-black hover:bg-gray-200">Start Free Trial</Button>
              </Link>
              <Link to="/subscription/contact">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
