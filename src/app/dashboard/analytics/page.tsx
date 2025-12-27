"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BarChart3, Crown, Download, Lock, TrendingUp, Users, Zap } from "lucide-react"
import { useState } from "react"

export default function AnalyticsPage() {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen flex items-center justify-center 
        bg-gray-50 dark:bg-black p-4">

        <Card className="max-w-md w-full mx-4 shadow-2xl 
          border-2 border-black dark:border-gray-800 
          bg-white dark:bg-black">

          <CardHeader className="text-center pb-4">
            <div className="bg-black dark:bg-black text-white rounded-full 
              w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>

            <CardTitle className="text-2xl dark:text-white">
              Unlock Premium Analytics
            </CardTitle>

            <CardDescription className="text-base text-gray-600 dark:text-gray-300">
              Get detailed insights into your performance with advanced analytics
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">

              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-black rounded-full p-1 border dark:border-gray-700">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-white" />
                </div>
                <span className="text-sm dark:text-gray-300">Advanced performance metrics</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-black rounded-full p-1 border dark:border-gray-700">
                  <Users className="h-4 w-4 text-blue-600 dark:text-white" />
                </div>
                <span className="text-sm dark:text-gray-300">Detailed audience demographics</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-black rounded-full p-1 border dark:border-gray-700">
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-white" />
                </div>
                <span className="text-sm dark:text-gray-300">Real-time engagement tracking</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-black rounded-full p-1 border dark:border-gray-700">
                  <Download className="h-4 w-4 text-orange-600 dark:text-white" />
                </div>
                <span className="text-sm dark:text-gray-300">Export data & custom reports</span>
              </div>
            </div>

            <Button 
              onClick={() => setShowPremiumDialog(true)} 
              className="w-full bg-black dark:bg-black text-white 
                hover:bg-gray-900 dark:hover:bg-gray-900"
            >
              <Crown className="h-4 w-4 mr-2 text-white" />
              Upgrade to Premium
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Starting at $9.99/month • 14-day free trial
            </p>
          </CardContent>
        </Card>

        {/* Premium Dialog */}
        <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
          <DialogContent 
            className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto 
              left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              bg-white dark:bg-black dark:text-white 
              border dark:border-gray-800"
          >

            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl dark:text-white">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                Upgrade to Premium Analytics
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base dark:text-white">
                    <Lock className="h-4 w-4 text-white" />
                    What you're missing:
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <p>• Real-time engagement tracking</p>
                    <p>• Audience demographic breakdowns</p>
                    <p>• Content performance comparisons</p>
                    <p>• Custom date range analysis</p>
                    <p>• Export capabilities</p>
                    <p>• Advanced filtering options</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base dark:text-white">
                    <Zap className="h-4 w-4 text-white" />
                    Premium Benefits:
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <p>• Unlimited analytics access</p>
                    <p>• Priority customer support</p>
                    <p>• Advanced scheduling tools</p>
                    <p>• Team collaboration features</p>
                    <p>• Custom branding options</p>
                    <p>• API access for integrations</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-black p-3 sm:p-4 rounded-lg border dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm sm:text-base dark:text-white">Premium Plan</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-black dark:text-white">$9.99</span>
                    <span className="text-gray-500 dark:text-gray-300 text-sm">/month</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                  Everything you need to grow your presence and understand your audience
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    className="flex-1 bg-black dark:bg-black text-white 
                      hover:bg-gray-900 dark:hover:bg-gray-900 text-sm sm:text-base py-2"
                  >
                    Start 14-Day Free Trial
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent dark:bg-transparent dark:border-gray-700 dark:text-white text-sm sm:text-base py-2"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
