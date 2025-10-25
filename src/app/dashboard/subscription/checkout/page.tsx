"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, Check, ArrowLeft, Shield, Star } from "lucide-react"

const planDetails = {
  pro: {
    name: "Pro",
    price: 9.99,
    features: [
      "Unlimited posts",
      "Advanced analytics",
      "Custom themes",
      "Priority support",
      "Video uploads (4K)",
      "Scheduled posting",
    ],
  },
  premium: {
    name: "Premium",
    price: 19.99,
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Team collaboration",
      "API access",
      "Dedicated support",
      "Early access features",
    ],
  },
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const planType = (searchParams.get("plan") as "pro" | "premium") || "pro"
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const plan = planDetails[planType]
  const price = billingPeriod === "yearly" ? plan.price * 10 : plan.price
  const savings = billingPeriod === "yearly" ? plan.price * 2 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page or dashboard
    window.location.href = "/dashboard/subscription/success"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard/subscription" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Link>
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="text-gray-600">Join thousands of creators who trust Lupyd</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Lupyd {plan.name}</h3>
                  <Badge className="bg-black text-white">{planType === "pro" ? "Most Popular" : "Best Value"}</Badge>
                </div>

                {/* Billing Period Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      billingPeriod === "monthly" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod("yearly")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative ${
                      billingPeriod === "yearly" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                      Save 17%
                    </span>
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    Lupyd {plan.name} ({billingPeriod})
                  </span>
                  <span>${price}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Yearly discount</span>
                    <span>-${savings}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${price}</span>
              </div>

              {/* Trial Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">14-Day Free Trial</p>
                    <p className="text-sm text-blue-700">
                      You won't be charged until your trial ends. Cancel anytime during the trial period.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === "card" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === "paypal" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      PayPal
                    </button>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <>
                    {/* Card Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Billing Information</h3>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="123 Main St" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="New York" required />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input id="zip" placeholder="10001" required />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Start Free Trial - $${price}/${billingPeriod === "yearly" ? "year" : "month"}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription
                  at any time.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
