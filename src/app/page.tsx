'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Baby,
  BotMessageSquare,
  ClipboardList,
  Home as HomeIcon,
  Menu,
  Nut,
  PanelLeft,
  Settings,
  HeartPulse,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PeriodTracker } from '@/components/her-health/PeriodTracker';
import { HormonalNutrition } from '@/components/her-health/HormonalNutrition';
import { MentalHealthChatbot } from '@/components/her-health/MentalHealthChatbot';
import { BabyHealthTracker } from '@/components/her-health/BabyHealthTracker';

type NavItem =
  | 'period-tracker'
  | 'hormonal-nutrition'
  | 'mental-health'
  | 'baby-health';

export default function Home() {
  const [activeComponent, setActiveComponent] =
    useState<NavItem>('period-tracker');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'period-tracker':
        return <PeriodTracker />;
      case 'hormonal-nutrition':
        return <HormonalNutrition />;
      case 'mental-health':
        return <MentalHealthChatbot />;
      case 'baby-health':
        return <BabyHealthTracker />;
      default:
        return <PeriodTracker />;
    }
  };

  const NavLink = ({
    navId,
    Icon,
    label,
  }: {
    navId: NavItem;
    Icon: React.ElementType;
    label: string;
  }) => (
    <Button
      variant={activeComponent === navId ? 'secondary' : 'ghost'}
      className="w-full justify-start gap-2"
      onClick={() => setActiveComponent(navId)}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <HeartPulse className="h-6 w-6 text-accent-foreground/80" />
          <span className="text-xl">HerHealthAI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <NavLink navId="period-tracker" Icon={ClipboardList} label="Period Tracker" />
        <NavLink navId="hormonal-nutrition" Icon={Nut} label="Hormonal Nutrition" />
        <NavLink navId="mental-health" Icon={BotMessageSquare} label="Mental Health Chat" />
        <NavLink navId="baby-health" Icon={Baby} label="Baby Health Tracker" />
      </nav>
    </>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {sidebarContent}
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-16 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
             {sidebarContent}
            </SheetContent>
          </Sheet>
           <h1 className="flex-1 text-lg font-semibold md:text-2xl">
            {
              {
                'period-tracker': 'Period Tracker Dashboard',
                'hormonal-nutrition': 'Hormonal Nutrition Advisor',
                'mental-health': 'Mental Health Support',
                'baby-health': 'Baby Health Tracker',
              }[activeComponent]
            }
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}
