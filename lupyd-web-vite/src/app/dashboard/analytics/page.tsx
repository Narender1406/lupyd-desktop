"use client"

import { Crown, TrendingUp, Users, BarChart3, Download, Lock, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AnalyticsPage() {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)

  return (
    <DashboardLayout>
      <div className="w-full h-screen overflow-hidden flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-2 border-black">
          <CardHeader className="text-center pb-4">
            <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Unlock Premium Analytics</CardTitle>
            <CardDescription className="text-base">
              Get detailed insights into your performance with advanced analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Advanced performance metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm">Detailed audience demographics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-full p-1">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm">Real-time engagement tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 rounded-full p-1">
                  <Download className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm">Export data & custom reports</span>
              </div>
            </div>
            <Button onClick={() => setShowPremiumDialog(true)} className="w-full bg-black text-white hover:bg-gray-800">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <p className="text-xs text-center text-gray-500">Starting at $9.99/month • 14-day free trial</p>
          </CardContent>
        </Card>

        {/* Premium Upgrade Dialog */}
        <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                Upgrade to Premium Analytics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Lock className="h-4 w-4" />
                    What you're missing:
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <p>• Real-time engagement tracking</p>
                    <p>• Audience demographic breakdowns</p>
                    <p>• Content performance comparisons</p>
                    <p>• Custom date range analysis</p>
                    <p>• Export capabilities</p>
                    <p>• Advanced filtering options</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Zap className="h-4 w-4" />
                    Premium Benefits:
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <p>• Unlimited analytics access</p>
                    <p>• Priority customer support</p>
                    <p>• Advanced scheduling tools</p>
                    <p>• Team collaboration features</p>
                    <p>• Custom branding options</p>
                    <p>• API access for integrations</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm sm:text-base">Premium Plan</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold">$9.99</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Everything you need to grow your presence and understand your audience
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button className="flex-1 bg-black text-white hover:bg-gray-800 text-sm sm:text-base py-2">
                    Start 14-Day Free Trial
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent text-sm sm:text-base py-2">
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  No credit card required • Cancel anytime • Full access during trial
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
