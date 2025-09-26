export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
