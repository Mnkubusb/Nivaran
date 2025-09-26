import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, MessageSquarePlus, Users } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-64 flex flex-col border-r p-4">
        <div className="flex items-center gap-2 h-16 mb-4">
          <Logo className="h-8 w-auto text-primary" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <Button asChild variant="ghost" className="justify-start">
                <Link href="/screening">
                    <MessageSquarePlus /> New Conversation
                </Link>
            </Button>
            <nav className="mt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore</h3>
                <div className='flex flex-col gap-1'>
                     <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                        <Link href="/resources">
                            <BookOpen /> Resource Hub
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                        <Link href="/peer-support">
                            <Users /> Peer Support
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                        <Link href="/counsellor">
                            <Briefcase /> Find a Counsellor
                        </Link>
                    </Button>
                </div>
            </nav>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
