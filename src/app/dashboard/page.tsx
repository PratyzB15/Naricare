'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Bot,
  Baby,
  ShieldCheck,
  Video,
  ShoppingBag,
  HeartPulse,
  User,
  LogOut,
  Ribbon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardPeriodCard } from '@/components/her-health/DashboardPeriodCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const features = [
  {
    title: 'Period Tracker',
    description: 'Track your cycle, predict periods, and get insights.',
    icon: CalendarDays,
    href: '/period-tracker',
    color: 'text-pink-500',
    bgColor: 'bg-pink-100/50',
  },
  {
    title: 'Nutrition & Lifestyle',
    description: 'Personalized diet and lifestyle recommendations.',
    icon: HeartPulse,
    href: '/nutrition-lifestyle',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100/50',
  },
  {
    title: 'Mental Health Chatbot',
    description: 'Talk to an AI companion for mental wellness.',
    icon: Bot,
    href: '/mental-health-chatbot',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100/50',
  },
  {
    title: 'Pregnancy and Baby Health Tracker',
    description: "Track baby's growth and health via ultrasound.",
    icon: Baby,
    href: '/pregnancy-baby-tracker',
    color: 'text-teal-500',
    bgColor: 'bg-teal-100/50',
  },
    {
    title: 'Cancer Screening',
    description: 'Self-examination guides and symptom analysis.',
    icon: Ribbon,
    href: '/cancer-screening',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100/50',
  },
  {
    title: 'Medical Store',
    description: 'Shop for pads, tampons, and medicines.',
    icon: ShoppingBag,
    href: '/medical-store',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100/50',
  },
  {
    title: 'Gyno-Consultation',
    description: 'Video call with professional gynecologists.',
    icon: Video,
    href: '/consultation',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100/50',
  },
  {
    title: 'SOS Panic Button',
    description: 'Immediate help for emergencies.',
    icon: ShieldCheck,
    href: '/sos',
    color: 'text-red-600',
    bgColor: 'bg-red-100/50',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
    } else {
      setCurrentUserEmail(email);
    }
  }, [router]);

  const handleSignOut = () => {
    // In a real app, you'd clear tokens, etc.
    localStorage.removeItem('currentUserEmail');
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <header className="mb-10 flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-primary-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Explore the tools to manage your health.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <DashboardPeriodCard />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} className="group">
              <Card className="hover:shadow-2xl hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col p-6 rounded-2xl transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-start gap-4 p-0">
                  <div className={`rounded-full p-3 ${feature.bgColor}`}>
                    <feature.icon className={`w-8 h-8 ${feature.color} transition-transform group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
