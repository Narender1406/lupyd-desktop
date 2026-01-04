"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCard } from "@/components/animated-card"
import {
  UserPlus,
  Filter,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import React from "react"

export default function ConnectionsPage() {


  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gray-50" style={{ paddingBottom: '0px' }}>
        <main className="flex-1">
          {/* Content */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Connections</h1>
                <p className="text-muted-foreground">Manage your network and discover new connections</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
                >
                  All Connections
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="suggestions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
                >
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatedCard delay={0.1}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Sarah Johnson" />
                            <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Sarah Johnson</h3>
                          <p className="text-muted-foreground mb-2">UX Designer at DesignCo</p>
                          <p className="text-sm text-muted-foreground mb-4">Connected since May 2023</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.2}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Alex Chen" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Alex Chen</h3>
                          <p className="text-muted-foreground mb-2">Software Engineer at TechCorp</p>
                          <p className="text-sm text-muted-foreground mb-4">Connected since June 2023</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.3}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Emily Wong" />
                            <AvatarFallback>EW</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Emily Wong</h3>
                          <p className="text-muted-foreground mb-2">Product Manager at InnovateCo</p>
                          <p className="text-sm text-muted-foreground mb-4">Connected since April 2023</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.4}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Michael Brown" />
                            <AvatarFallback>MB</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Michael Brown</h3>
                          <p className="text-muted-foreground mb-2">Marketing Director at BrandX</p>
                          <p className="text-sm text-muted-foreground mb-4">Connected since July 2023</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Pending Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>You have no pending connection requests at this time.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatedCard delay={0.1}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Sophia Lee" />
                            <AvatarFallback>SL</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Sophia Lee</h3>
                          <p className="text-muted-foreground mb-2">Product Designer at DesignHub</p>
                          <p className="text-sm text-muted-foreground mb-4">12 mutual connections</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.2}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="David Kim" />
                            <AvatarFallback>DK</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">David Kim</h3>
                          <p className="text-muted-foreground mb-2">Frontend Developer at WebTech</p>
                          <p className="text-sm text-muted-foreground mb-4">8 mutual connections</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.3}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Jessica Martinez" />
                            <AvatarFallback>JM</AvatarFallback>
                        </Avatar>
                          <h3 className="font-bold text-lg">Jessica Martinez</h3>
                          <p className="text-muted-foreground mb-2">Content Strategist at ContentLab</p>
                          <p className="text-sm text-muted-foreground mb-4">5 mutual connections</p>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}