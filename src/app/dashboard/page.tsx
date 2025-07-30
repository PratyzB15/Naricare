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

const features = [
  {
    title: 'Period Tracker',
    description: 'Track your cycle, predict periods, and get insights.',
    icon: CalendarDays,
    href: '/period-tracker',
    color: 'text-red-400',
  },
  {
    title: 'Nutrition & Lifestyle',
    description: 'Personalized diet and lifestyle recommendations.',
    icon: HeartPulse,
    href: '/nutrition-lifestyle',
    color: 'text-green-400',
  },
  {
    title: 'Mental Health Chatbot',
    description: 'Talk to an AI companion for mental wellness.',
    icon: Bot,
    href: '/mental-health-chatbot',
    color: 'text-pink-400',
  },
  {
    title: 'Baby Health Tracker',
    description: 'Track baby\'s growth and health via ultrasound.',
    icon: Baby,
    href: '/baby-health-tracker',
    color: 'text-teal-400',
  },
  {
    title: 'Medical Store',
    description: 'Shop for pads, tampons, and medicines.',
    icon: ShoppingBag,
    href: '/medical-store',
    color: 'text-blue-400',
  },
  {
    title: 'Gyno-Consultation',
    description: 'Video call with professional gynecologists.',
    icon: Video,
    href: '/consultation',
    color: 'text-purple-400',
  },
  {
    title: 'SOS Panic Button',
    description: 'Immediate help for emergencies.',
    icon: ShieldCheck,
    href: '/sos',
    color: 'text-yellow-500',
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here are your health tools.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title}>
              <Card className="hover:shadow-lg hover:border-accent transition-all cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <feature.icon className={`w-10 h-10 ${feature.color}`} />
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
