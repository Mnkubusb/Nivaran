
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Headphones, Search, Youtube, Music } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { searchResources } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
};

export default function ResourcesPage() {
  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [audioPlayer, setAudioPlayer] = useState<{ url: string; title: string } | null>(null);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    
    startTransition(async () => {
      const results = await searchResources(query);
      setSearchResults(results);
    });
  };

  const playAudio = (url: string, title: string) => {
    setAudioPlayer({ url, title });
  };


  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
          <p className="text-muted-foreground mt-2">A curated library of articles, tools, and guides to support your well-being.</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search for guided meditations, calming music, and more..."
              className="pl-10 w-full"
              disabled={isPending}
            />
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-40 w-full" />
                </CardHeader>
                <CardContent className="flex-grow pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : (
            searchResults.map((result) => (
              <Card key={result.id} className="flex flex-col">
                <CardHeader>
                  <div className="relative aspect-video rounded-t-lg overflow-hidden -m-6 mb-0">
                    <Image
                      src={result.thumbnail}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-8">
                  <CardTitle className="mb-2 text-base">{result.title}</CardTitle>
                </CardContent>
                <CardFooter className="flex gap-2">
                   <Button asChild variant="outline" className="w-full">
                    <Link href={result.url} target="_blank">
                      <Youtube className="mr-2" /> Watch
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" onClick={() => playAudio(result.url, result.title)}>
                      <Music className="mr-2" /> Listen
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {searchResults.length === 0 && !isPending && (
             <div className="text-center text-muted-foreground mt-12">
                 <p>Search for topics like "mindfulness" or "anxiety relief" to get started.</p>
             </div>
        )}

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
      {audioPlayer && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t mt-4">
            <div className="container mx-auto flex items-center gap-4">
                <p className="font-semibold text-sm flex-grow">Now Playing: {audioPlayer.title}</p>
                <audio controls autoPlay src={audioPlayer.url} className="w-full max-w-md">
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
      )}
    </ScrollArea>
  )
}
