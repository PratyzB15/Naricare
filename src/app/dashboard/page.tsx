'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    description: "Track baby's growth and health via ultrasound.",
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Explore the tools to manage your health.</p>
      </header>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
              <Card className="hover:shadow-2xl hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col p-6 rounded-2xl transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-start gap-4 p-0">
                  <div className={`rounded-full p-3 bg-secondary ${feature.color}`}>
                    <feature.icon className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
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
  );
}
