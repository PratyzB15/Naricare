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
  Flower2,
  Heart,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-background">
      <section className="bg-secondary/50 py-12 sm:py-20 lg:py-28">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">
              Your Health, <br />
              <span className="text-primary-foreground">Your Priority</span>
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-muted-foreground md:text-lg">
              Comprehensive women's health tracking with period monitoring, fertility insights, and personalized wellness guidance - designed for every woman, everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-pink-400/80 text-white hover:bg-pink-400">Start Tracking Today</Button>
              <Button size="lg" variant="outline">Learn More</Button>
            </div>
            <div className="flex justify-center lg:justify-start gap-8 pt-4">
                <div>
                    <p className="font-bold text-pink-500 text-lg">24/7</p>
                    <p className="text-sm text-muted-foreground">Support</p>
                </div>
                 <div>
                    <p className="font-bold text-green-500 text-lg">100+</p>
                    <p className="text-sm text-muted-foreground">Languages</p>
                </div>
                 <div>
                    <p className="font-bold text-blue-500 text-lg">Safe</p>
                    <p className="text-sm text-muted-foreground">& Secure</p>
                </div>
            </div>
          </div>
          <div className="relative">
             <Image
                src="https://placehold.co/600x400.png"
                width={600}
                height={400}
                alt="Women's Health"
                className="rounded-xl shadow-2xl"
                data-ai-hint="happy women group"
             />
             <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                <Flower2 className="text-pink-400 h-6 w-6"/>
             </div>
             <div className="absolute -bottom-6 left-10 bg-white p-3 rounded-full shadow-lg">
                <Heart className="text-green-400 h-6 w-6"/>
             </div>
          </div>
        </div>
      </section>

      <section className="py-16">
         <header className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">Features</h2>
          <p className="text-muted-foreground">Explore the tools to manage your health.</p>
        </header>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title}>
                <Card className="hover:shadow-xl hover:border-accent transition-all cursor-pointer h-full flex flex-col group">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <feature.icon className={`w-10 h-10 ${feature.color} transition-transform group-hover:scale-110`} />
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
