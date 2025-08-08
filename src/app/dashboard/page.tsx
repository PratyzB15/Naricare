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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardPeriodCard } from '@/components/her-health/DashboardPeriodCard';

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
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Explore the tools to manage your health.</p>
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
