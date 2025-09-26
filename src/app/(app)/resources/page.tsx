import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Headphones, BookText } from "lucide-react";

const resources = [
  {
    title: "Understanding Anxiety",
    description: "An in-depth article about the symptoms, causes, and treatments for anxiety disorders.",
    icon: BrainCircuit,
    link: "#",
    type: "Article"
  },
  {
    title: "Guided Meditation for Sleep",
    description: "A 15-minute audio guide to help you relax and fall asleep peacefully.",
    icon: Headphones,
    link: "#",
    type: "Audio"
  },
  {
    title: "The PHQ-9 Explained",
    description: "Learn more about the PHQ-9 screening tool and what the scores mean.",
    icon: BookText,
    link: "#",
    type: "Guide"
  },
  {
    title: "Coping with Depression",
    description: "Practical strategies and techniques for managing symptoms of depression.",
    icon: BrainCircuit,
    link: "#",
    type: "Article"
  },
  {
    title: "Mindful Breathing Exercise",
    description: "A short, 5-minute breathing exercise to calm your mind and reduce stress.",
    icon: Headphones,
    link: "#",
    type: "Audio"
  },
  {
    title: "Understanding GAD-7",
    description: "A complete guide to the GAD-7 screening, its purpose, and interpretation.",
    icon: BookText,
    link: "#",
    type: "Guide"
  },
];


export default function ResourcesPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-headline">Resource Hub</h2>
        <p className="text-muted-foreground">A curated library of articles, tools, and guides to support your well-being.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                    <resource.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.type}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{resource.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={resource.link}>
                  View Resource <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
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
  )
}
