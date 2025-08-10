'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Baby,
  Bot,
  CalendarDays,
  HeartPulse,
  Home,
  ShoppingBag,
  Video,
  User,
  Ribbon,
  BookOpen,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../her-health/Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/period-tracker',
      icon: CalendarDays,
      label: 'Period Tracker',
    },
    {
      href: '/nutrition-lifestyle',
      icon: HeartPulse,
      label: 'Nutrition & Lifestyle',
    },
    {
      href: '/mental-health-chatbot',
      icon: Bot,
      label: 'Mental Health Chatbot',
    },
    {
      href: '/pregnancy-baby-tracker',
      icon: Baby,
      label: 'Pregnancy & Baby Tracker',
    },
    {
      href: '/cancer-screening',
      icon: Ribbon,
      label: 'Cancer Screening',
    },
    {
        href: '/sex-education',
        icon: BookOpen,
        label: 'Sex Education',
    },
    {
        href: '/medical-store',
        icon: ShoppingBag,
        label: 'Medical Store',
    },
    {
        href: '/consultation',
        icon: Video,
        label: 'Gyno-Consultation',
    }
  ];
  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">HerHealthAI</span>
            </div>
          </SidebarHeader>
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
           <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/profile'}
                      tooltip={{ children: 'Profile' }}
                    >
                      <Link href="/profile">
                        <User />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
              </SidebarMenu>
           </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </>
  );
}
