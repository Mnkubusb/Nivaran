import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";

const supportGroups = [
    {
        name: "Anxiety & Panic Support Group",
        description: "A safe space to share experiences and coping strategies for anxiety and panic attacks.",
        members: 128,
    },
    {
        name: "Depression & Mood Disorders Alliance",
        description: "Connect with others who understand the challenges of living with depression.",
        members: 245,
    },
    {
        name: "Student Mental Wellness Chat",
        description: "A group for students to discuss academic stress, social pressures, and well-being.",
        members: 98,
    }
]

export default function PeerSupportPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Peer Support Network</h1>
                <p className="text-muted-foreground mt-2">Connect with others who share similar experiences. You are not alone.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportGroups.map((group, index) => (
                    <Card key={index} className="flex flex-col">
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
                            <Button className="w-full">
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
