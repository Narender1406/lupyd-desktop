"use client"

import React, { useEffect, useState } from "react";
import { useUserData } from "@/context/userdata-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCard } from "@/components/animated-card";
import { Button } from "@/components/ui/button";
import { UserMinus, MessageSquare, Image, FileText, Users } from "lucide-react";

// Avatar elements
import { UserAvatar } from "@/components/user-avatar";

export default function BlockedContent() {
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [blockedPosts, setBlockedPosts] = useState<string[]>([]);
    const [blockedComments, setBlockedComments] = useState<string[]>([]);
    const [blockedImages, setBlockedImages] = useState<string[]>([]);
    const [blockedMessages, setBlockedMessages] = useState<string[]>([]);

    const userData = useUserData()
  
    useEffect(() => {
        setBlockedUsers(userData.blocked)
    }, [userData])
  
    const unblock = async(
        listSetter: React.Dispatch<React.SetStateAction<string[]>>,
        item: string
    ) => {
        listSetter((prev) => prev.filter((entry) => entry !== item));
        await userData.relationState.unblockUser(item)
    };
     
    const unblockUser = async(username : string) => { 
        await userData.relationState.unblockUser(username)
    }

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768)
        }

        checkIsMobile()
        window.addEventListener('resize', checkIsMobile)
        return () => window.removeEventListener('resize', checkIsMobile)
    }, [])

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 max-w-full" style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 24px)' : '0px' }}>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Blocked Content</h1>
                    <p className="text-muted-foreground">Manage your blocked users and content</p>
                </div>

                <Tabs defaultValue="users" className="w-full">
                    <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
                        <div className="min-w-max px-4 sm:px-0">
                            <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto flex-nowrap">
                                <TabsTrigger
                                    value="users"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Blocked Users
                                </TabsTrigger>
                                <TabsTrigger
                                    value="posts"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Blocked Posts
                                </TabsTrigger>
                                <TabsTrigger
                                    value="comments"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Blocked Comments
                                </TabsTrigger>
                                <TabsTrigger
                                    value="media"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                                >
                                    <Image className="h-4 w-4 mr-2" />
                                    Blocked Media
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4 whitespace-nowrap"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Blocked Messages
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <div className="w-full">
                        <TabsContent value="users" className="mt-0 space-y-6 w-full">
                            <Section
                                title="Blocked Users"
                                list={blockedUsers}
                                onUnblock={(item) => unblockUser(item)}
                                icon={<UserMinus className="h-5 w-5" />}
                            />
                        </TabsContent>

                        <TabsContent value="posts" className="mt-0 space-y-6 w-full">
                            <Section
                                title="Blocked Posts"
                                list={blockedPosts}
                                onUnblock={(item) => unblock(setBlockedPosts, item)}
                                icon={<FileText className="h-5 w-5" />}
                            />
                        </TabsContent>

                        <TabsContent value="comments" className="mt-0 space-y-6 w-full">
                            <Section
                                title="Blocked Comments"
                                list={blockedComments}
                                onUnblock={(item) => unblock(setBlockedComments, item)}
                                icon={<MessageSquare className="h-5 w-5" />}
                            />
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 space-y-6 w-full">
                            <Section
                                title="Blocked Images / Media"
                                list={blockedImages}
                                isImage
                                onUnblock={(item) => unblock(setBlockedImages, item)}
                                icon={<Image className="h-5 w-5" />}
                            />
                        </TabsContent>

                        <TabsContent value="messages" className="mt-0 space-y-6 w-full">
                            <Section
                                title="Blocked Messages / Chats"
                                list={blockedMessages}
                                isMessage
                                onUnblock={(item) => unblock(setBlockedMessages, item)}
                                icon={<MessageSquare className="h-5 w-5" />}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

type SectionProps = {
    title: string;
    list: string[];
    onUnblock: (item: string) => void;
    isImage?: boolean;
    isMessage?: boolean;
    icon?: React.ReactNode;
};

function Section({ title, list, onUnblock, isImage, isMessage, icon }: SectionProps) {
    return (
        <AnimatedCard>
            <Card className="border-none shadow-sm w-full">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center">
                        {icon && <span className="mr-2">{icon}</span>}
                        {title}
                    </CardTitle>
                    <CardDescription>
                        {list.length === 0 
                            ? "No blocked content found" 
                            : `${list.length} item${list.length === 1 ? '' : 's'} blocked`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4 overflow-visible">
                    {list.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No blocked content found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {list.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm flex justify-between items-start"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        
                                       <UserAvatar username={item} />

                                        <div className="flex-1">
                                            {isImage ? (
                                                <img
                                                    src={item}
                                                    alt="Blocked media"
                                                    className="w-32 h-32 object-cover rounded-lg"
                                                />
                                            ) : isMessage ? (
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{item}</p>
                                            ) : (
                                                <p className="text-gray-700 dark:text-gray-300">{item}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => onUnblock(item)}
                                        variant="outline"
                                        size="sm"
                                        className="ml-4 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                        Unblock
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedCard>
    );
}