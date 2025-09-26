import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Logo className="h-8 w-auto" />
        </Link>
      </div>
      {children}
    </div>
  );
}
