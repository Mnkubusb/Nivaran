"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Heart, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


const supportGroups = [
    {
        id: "anxiety_panic",
        name: "Anxiety & Panic Support Group",
        description: "A safe space to share experiences and coping strategies for anxiety and panic attacks.",
        members: 128,
    },
    {
        id: "depression_mood",
        name: "Depression & Mood Disorders Alliance",
        description: "Connect with others who understand the challenges of living with depression.",
        members: 245,
    },
    {
        id: "student_wellness",
        name: "Student Mental Wellness Chat",
        description: "A group for students to discuss academic stress, social pressures, and well-being.",
        members: 98,
    }
];

type Message = {
    id: string;
    text: string;
    uid: string;
    displayName: string;
    createdAt: Timestamp;
}

function ChatRoom({ group, onBack }: { group: typeof supportGroups[0], onBack: () => void }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
    }, [messages]);

    useEffect(() => {
        if (!group.id) return;
        const q = query(collection(db, "supportGroups", group.id, "messages"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [group.id]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || newMessage.trim() === "") return;

        await addDoc(collection(db, "supportGroups", group.id, "messages"), {
            text: newMessage,
            uid: user.uid,
            displayName: user.displayName || user.email,
            createdAt: serverTimestamp(),
        });
        setNewMessage("");
    };

    return (
        <Card className="flex flex-col h-[70vh] w-full">
            <CardHeader className="flex flex-row items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft />
                </Button>
                <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0">
                <ScrollArea className="flex-grow p-6" viewportRef={viewportRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                             <div
                                key={msg.id}
                                className={cn(
                                    "flex items-start gap-3",
                                    msg.uid === user?.uid ? "justify-end" : "justify-start"
                                )}
                                >
                                {msg.uid !== user?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                    "max-w-xs lg:max-w-md rounded-xl px-4 py-2 text-sm",
                                    msg.uid === user?.uid
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                   <p className="font-bold text-xs mb-1">{msg.uid === user?.uid ? "You" : msg.displayName}</p>
                                   <p>{msg.text}</p>
                                   <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                                     {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </p>
                                </div>
                                {msg.uid === user?.uid && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PeerSupportPage() {
    const [selectedGroup, setSelectedGroup] = useState<typeof supportGroups[0] | null>(null);
    const { user } = useAuth();

    if (!user) {
        return (
             <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-muted-foreground mt-2">You need to be logged in to access peer support.</p>
                <Button asChild className="mt-4">
                    <Link href="/login">Login</Link>
                </Button>
             </div>
        )
    }

    if (selectedGroup) {
        return <ChatRoom group={selectedGroup} onBack={() => setSelectedGroup(null)} />
    }

    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Peer Support Network</h1>
                <p className="text-muted-foreground mt-2">Connect with others who share similar experiences. You are not alone.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportGroups.map((group) => (
                    <Card key={group.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{group.name}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{group.members}</span>
                                </div>
                            </div>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <Button className="w-full" onClick={() => setSelectedGroup(group)}>
                                <MessageCircle className="mr-2 h-4 w-4" /> Join Conversation
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-12">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-2">
                        <Heart className="w-8 h-8" />
                    </div>
                    <CardTitle>Become a Peer Supporter</CardTitle>
                    <CardDescription>Interested in helping others? Learn more about our peer support training program.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button variant="outline">Learn More</Button>
                </CardContent>
            </Card>

            <div className="mt-12 text-center">
                <Button asChild>
                    <Link href="/screening">Back to Chat</Link>
                </Button>
            </div>
        </div>
    )
}
