import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="fixed top-4 inset-x-0 container mx-auto z-50">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center shadow-lg border">
          <Link href="#" className="flex items-center justify-center" prefetch={false}>
            <Logo className="h-8 w-auto" />
            <span className="sr-only">WellConverse</span>
          </Link>
          <nav className="ml-auto flex gap-6 items-center">
            <Link
              href="/resources"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Resources
            </Link>
             <Link
              href="/peer-support"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Peer Support
            </Link>
             <Link
              href="/counsellor"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Counsellors
            </Link>
            <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
            </Button>
            <Button asChild>
              <Link href="/signup" prefetch={false}>
                Start Building
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full pt-48 pb-12 md:pb-24 lg:pb-32 xl:pb-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-1 lg:gap-12 text-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline">
                    Let&apos;s make your dream a <span className="text-primary-foreground bg-primary/80 px-2 rounded-md">reality.</span>
                  </h1>
                   <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline">
                    Right now.
                  </h1>
                  <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                    WellConverse offers a safe and confidential space to check in with yourself through guided, conversational screenings powered by AI.
                  </p>
                </div>
                <div className="flex justify-center flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup" prefetch={false}>
                      Start a Conversation
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Core Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Support Tailored to You
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our tools are designed to be supportive, non-judgmental, and always available when you need them.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/20 text-primary-foreground p-3 rounded-full w-fit">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4">Conversational Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Engage in natural conversations with our AI to complete mental health screenings like PHQ-9 and GAD-7.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/20 text-primary-foreground p-3 rounded-full w-fit">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4">Resource Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access a curated library of articles, videos, and tools to support your mental wellness journey.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/20 text-primary-foreground p-3 rounded-full w-fit">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4">Private & Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your conversations are confidential. We prioritize your privacy with secure authentication and data handling.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} WellConverse. All rights reserved.
        </p>
        <div className="sm:ml-auto flex gap-4 sm:gap-6 text-xs text-muted-foreground">
          Disclaimer: This is not a replacement for professional medical advice.
        </div>
      </footer>
    </div>
  );
}
