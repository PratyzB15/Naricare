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
  MapPin,
  ShieldCheck,
  HardHat,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../her-health/Header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserType = 'self' | 'family';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('self');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    const type = localStorage.getItem(`${email}_userType`) as UserType || 'self';
    setUserType(type);
  }, [router]);

  const navItems = [
    {
      href: '/period-tracker',
      icon: CalendarDays,
      label: 'Period Tracker',
      userTypes: ['self'],
    },
    {
      href: '/nutrition-lifestyle',
      icon: HeartPulse,
      label: 'Nutrition & Lifestyle',
      userTypes: ['self', 'family'],
    },
    {
      href: '/mental-health-chatbot',
      icon: Bot,
      label: 'Mental Health Chatbot',
       userTypes: ['self'],
    },
    {
      href: '/pregnancy-baby-tracker',
      icon: Baby,
      label: 'Pregnancy & Baby Tracker',
       userTypes: ['self'],
    },
    {
      href: '/cancer-screening',
      icon: Ribbon,
      label: 'Cancer Screening',
      userTypes: ['self'],
    },
    {
      href: '/occupational-health',
      icon: HardHat,
      label: 'Occupational Health',
      userTypes: ['self'],
    },
    {
        href: '/sex-education',
        icon: BookOpen,
        label: 'Sex Education',
        userTypes: ['self'],
    },
    {
        href: '/medical-store',
        icon: ShoppingBag,
        label: 'Medical Store',
        userTypes: ['self', 'family'],
    },
    {
        href: '/consultation',
        icon: Video,
        label: 'Gyno-Consultation',
        userTypes: ['self', 'family'],
    },
    {
        href: '/location',
        icon: MapPin,
        label: 'Live Location',
        userTypes: ['family'],
    },
    {
        href: '/sos',
        icon: ShieldCheck,
        label: 'SOS Panic Button',
        userTypes: ['self', 'family'],
    }
  ];

  const visibleNavItems = navItems.filter(item => item.userTypes.includes(userType));
  
  if (!isClient) {
      return null; // Or a loading spinner
  }

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">NariCare</span>
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
            {visibleNavItems.map((item) => (
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
