"use client"

import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/animated-card"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your performance and engagement</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue="30days">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AnimatedCard>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <h3 className="text-2xl font-bold">4,892</h3>
                  <p className="text-xs text-muted-foreground mt-1">vs. 4,372 last period</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">8%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Followers</p>
                  <h3 className="text-2xl font-bold">246</h3>
                  <p className="text-xs text-muted-foreground mt-1">vs. 228 last period</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div className="flex items-center text-red-500">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">3%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <h3 className="text-2xl font-bold">5.2%</h3>
                  <p className="text-xs text-muted-foreground mt-1">vs. 5.4% last period</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">15%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <h3 className="text-2xl font-bold">28.5K</h3>
                  <p className="text-xs text-muted-foreground mt-1">vs. 24.8K last period</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
            <div className="min-w-max px-4 sm:px-0">
              <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto flex-nowrap">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="audience"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Audience
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Engagement
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <AnimatedCard>
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle>Audience Growth</CardTitle>
                    <CardDescription>Followers growth over time</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <LineChart className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-muted-foreground">Growth chart visualization</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <AnimatedCard delay={0.1}>
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle>Top Performing Content</CardTitle>
                      <CardDescription>Your best posts by engagement</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 rounded-md h-12 w-12 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">Design Portfolio Showcase</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                245
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                42
                              </span>
                              <span className="flex items-center">
                                <Share2 className="h-3 w-3 mr-1" />
                                18
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 rounded-md h-12 w-12 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">UX Design Principles</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                189
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                36
                              </span>
                              <span className="flex items-center">
                                <Share2 className="h-3 w-3 mr-1" />
                                12
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 rounded-md h-12 w-12 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">Product Launch Announcement</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                156
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                28
                              </span>
                              <span className="flex items-center">
                                <Share2 className="h-3 w-3 mr-1" />
                                24
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle>Engagement Breakdown</CardTitle>
                      <CardDescription>Distribution of engagement types</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                        <PieChart className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-muted-foreground">Engagement chart visualization</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Likes</p>
                          <p className="text-2xl font-bold">65%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Comments</p>
                          <p className="text-2xl font-bold">24%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Shares</p>
                          <p className="text-2xl font-bold">11%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="mt-0 space-y-6">
              <AnimatedCard>
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle>Audience Demographics</CardTitle>
                    <CardDescription>Understand who your audience is</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <PieChart className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-muted-foreground">Demographics chart visualization</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium">Age Range</p>
                        <p className="text-lg font-bold mt-1">25-34</p>
                        <p className="text-xs text-muted-foreground">42% of audience</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-lg font-bold mt-1">Female</p>
                        <p className="text-xs text-muted-foreground">58% of audience</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium">Top Location</p>
                        <p className="text-lg font-bold mt-1">United States</p>
                        <p className="text-xs text-muted-foreground">35% of audience</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium">Language</p>
                        <p className="text-lg font-bold mt-1">English</p>
                        <p className="text-xs text-muted-foreground">78% of audience</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="content" className="mt-0 space-y-6">
              <AnimatedCard>
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle>Content Performance</CardTitle>
                    <CardDescription>Analyze how your content is performing</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Content performance chart visualization
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Content Type Performance</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-24 text-sm">Images</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: "75%" }}></div>
                          </div>
                          <div className="w-12 text-right text-sm font-medium">75%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 text-sm">Videos</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: "62%" }}></div>
                          </div>
                          <div className="w-12 text-right text-sm font-medium">62%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 text-sm">Text</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <div className="w-12 text-right text-sm font-medium">45%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 text-sm">Links</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: "38%" }}></div>
                          </div>
                          <div className="w-12 text-right text-sm font-medium">38%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="engagement" className="mt-0 space-y-6">
              <AnimatedCard>
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>How users interact with your content</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <LineChart className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-muted-foreground">Engagement metrics chart visualization</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h3 className="font-medium mb-3">Engagement by Time of Day</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">Peak Hours</p>
                          <p className="text-muted-foreground">12:00 PM - 2:00 PM</p>
                          <p className="text-muted-foreground">7:00 PM - 9:00 PM</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Engagement by Day of Week</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">Best Days</p>
                          <p className="text-muted-foreground">Wednesday (highest)</p>
                          <p className="text-muted-foreground">Thursday (second highest)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
