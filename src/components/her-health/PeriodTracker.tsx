'use client';

import { useState, useEffect, useTransition } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, differenceInDays, formatISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarCard } from '@/components/her-health/CalendarCard';
import { CyclePhaseCard } from '@/components/her-health/CyclePhaseCard';
import type { PeriodPrediction } from '@/components/her-health/PeriodPredictionCard';
import { MedicationReminderCard } from '@/components/her-health/MedicationReminderCard';
import type { Medication } from '@/components/her-health/MedicationReminderCard';
import { predictPeriodAction } from '@/app/actions';

export function PeriodTracker() {
  const { toast } = useToast();
  const [isPredicting, startPredictionTransition] = useTransition();

  // Start with empty state for a new user
  const [cycles, setCycles] = useState<{ start: Date; end: Date }[]>([]);
  const [prediction, setPrediction] = useState<PeriodPrediction | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);

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

  const handlePrediction = (newCycles: { start: Date; end: Date }[]) => {
    startPredictionTransition(async () => {
      try {
        const pastCycleData = newCycles.map(c => formatISO(c.start, { representation: 'date' }));
        const result = await predictPeriodAction({
          pastCycleData,
          mood: 'calm', // Default values for auto-prediction
          physicalSymptoms: 'None',
        });
        setPrediction(result);
        toast({
          title: 'Prediction Updated',
          description: 'Your next period has been predicted based on your latest cycle.',
        });
      } catch (error) {
        console.error('Auto-prediction failed:', error);
        // Silently fail or show a non-intrusive message
      }
    });
  };

  const handleLogPeriod = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const newCycle = { start: range.from, end: range.to };
      const updatedCycles = [...cycles, newCycle].sort((a, b) => a.start.getTime() - b.start.getTime());
      setCycles(updatedCycles);
      toast({
        title: 'Cycle Logged',
        description: `Your period from ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()} has been logged.`,
      });
      // Trigger prediction automatically
      handlePrediction(updatedCycles);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Logging Period',
        description: 'Please select a start and end date for your period.',
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <CalendarCard
          cycles={cycles}
          prediction={prediction}
          onLogPeriod={handleLogPeriod}
        />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-4">
        <CyclePhaseCard lastCycleStart={cycles.length > 0 ? cycles[cycles.length - 1].start : undefined} />
        <MedicationReminderCard
          medications={medications}
          setMedications={setMedications}
        />
      </div>
    </div>
  );
}
