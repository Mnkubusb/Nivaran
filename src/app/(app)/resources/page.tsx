import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { resources } from "@/lib/resources";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ResourcesPage() {
  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
          <p className="text-muted-foreground mt-2">A curated library of articles, tools, and guides to support your well-being.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                {resource.type === "Video" && resource.source === "YouTube" ? (
                  <div className="aspect-video rounded-t-lg overflow-hidden -m-6 mb-0">
                    <iframe
                      src={`https://www.youtube.com/embed/${resource.url}`}
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-t-lg overflow-hidden -m-6 mb-0">
                  <Image
                    src={resource.thumbnail}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    data-ai-hint="mental wellness"
                  />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow pt-8">
                <CardTitle className="mb-2">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={resource.url.startsWith('http') ? resource.url : `https://www.youtube.com/watch?v=${resource.url}`} target="_blank">
                    View Resource <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
              <Button asChild>
                  <Link href="/screening">Back to Chat</Link>
              </Button>
          </div>
        <div className="mt-12 p-6 rounded-lg border bg-card text-card-foreground">
          <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-4 rounded-full">
                  <Headphones className="h-8 w-8 text-destructive" />
              </div>
              <div>
                  <h3 className="text-xl font-bold">Urgent Support</h3>
                  <p className="text-muted-foreground">If you are in a crisis or any other person may be in danger, please contact a crisis hotline.</p>
                  <Button asChild className="mt-2">
                      <a href="tel:988">Call 988 Crisis & Suicide Lifeline</a>
                  </Button>
              </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
