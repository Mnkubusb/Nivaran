import { Logo } from '@/components/logo';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-16 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-auto text-primary" />
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
