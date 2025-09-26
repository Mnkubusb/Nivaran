import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Phone, Video } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CounsellorPage() {
  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Find a Counsellor</h1>
          <p className="text-muted-foreground mt-2">Connect with licensed therapists and mental health professionals.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>National Suicide Prevention Lifeline</CardTitle>
              <CardDescription>24/7, free and confidential support.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                  <a href="tel:988"><Phone className="mr-2" /> Call 988</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crisis Text Line</CardTitle>
              <CardDescription>Text HOME to 741741 from anywhere in the US, anytime, about any type of crisis.</CardDescription>
            </CardHeader>
            <CardContent>
            <Button asChild className="w-full">
                  <a href="sms:741741"><Users className="mr-2" /> Text HOME to 741741</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>The Trevor Project</CardTitle>
              <CardDescription>Support for LGBTQ young people.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                  <a href="https://www.thetrevorproject.org/get-help/"><Video className="mr-2" /> Visit Website</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
              <Button asChild>
                  <Link href="/screening">Back to Chat</Link>
              </Button>
          </div>
      </div>
    </ScrollArea>
  )
}
