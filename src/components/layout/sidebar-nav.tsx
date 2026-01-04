'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Tractor, Map, Recycle, Leaf } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const farmerNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/reporting', icon: Tractor, label: 'Waste Reporting' },
  { href: '/tracking', icon: Map, label: 'Tracking' },
];

const agentNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/recycling', icon: Recycle, label: 'Assigned Collections' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = user?.role === 'farmer' ? farmerNavItems : agentNavItems;

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Leaf className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-bold text-foreground">
            AgriTrace
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
    </>
  );
}
