'use client';

import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/her-health/Header';
import { CalendarCard } from '@/components/her-health/CalendarCard';
import { PeriodPredictionCard } from '@/components/her-health/PeriodPredictionCard';
import type { PeriodPrediction } from '@/components/her-health/PeriodPredictionCard';
import { MedicationReminderCard } from '@/components/her-health/MedicationReminderCard';
import type { Medication } from '@/components/her-health/MedicationReminderCard';

export default function Home() {
  const { toast } = useToast();
  
  const [cycles, setCycles] = useState<{ start: Date; end: Date }[]>([
    {
      start: addDays(new Date(), -30),
      end: addDays(new Date(), -25),
    },
  ]);
  
  const [prediction, setPrediction] = useState<PeriodPrediction | null>(null);
  
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Contraceptive Pill', time: '21:00' },
  ]);

  useEffect(() => {
    if (prediction?.predictedStartDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const predictedDate = new Date(prediction.predictedStartDate);
      const daysUntil = differenceInDays(predictedDate, today);
      
      if (daysUntil === 2) {
        toast({
          title: 'Period Reminder',
          description: `Your period is predicted to start in 2 days, on ${predictedDate.toLocaleDateString()}.`,
        });
      }
    }
  }, [prediction, toast]);

  const handleLogPeriod = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const newCycle = { start: range.from, end: range.to };
      setCycles(prev => [...prev, newCycle].sort((a,b) => a.start.getTime() - b.start.getTime()));
      toast({
        title: 'Cycle Logged',
        description: `Your period from ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()} has been logged.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Error Logging Period',
        description: 'Please select a start and end date for your period.',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <CalendarCard 
              cycles={cycles} 
              prediction={prediction} 
              onLogPeriod={handleLogPeriod} 
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4">
            <PeriodPredictionCard 
              cycles={cycles}
              onPrediction={setPrediction}
            />
            <MedicationReminderCard 
              medications={medications}
              setMedications={setMedications}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
