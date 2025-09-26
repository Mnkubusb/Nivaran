'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  MessageSquare,
  PanelLeft,
  UserCircle,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const navItems = [
  { href: '/screening', icon: MessageSquare, label: 'Screening' },
  { href: '/resources', icon: BookOpen, label: 'Resources' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2 flex justify-center group-data-[collapsible=icon]:hidden">
            <Logo className="h-8 w-auto text-primary" />
          </div>
          <div className="p-2 hidden justify-center group-data-[collapsible=icon]:flex">
            <Logo className="h-8 w-auto text-primary" justIcon />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start gap-2 w-full p-2 h-12 text-left">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="truncate group-data-[collapsible=icon]:hidden">Guest User</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 ml-3" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Guest</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            guest@example.com
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                       <Link href="/" className="w-full">Log out</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-semibold text-lg md:text-xl">
              {navItems.find((item) => pathname.startsWith(item.href))?.label}
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
