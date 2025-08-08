'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { differenceInDays, addDays, parseISO, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Zap, Moon, Sun, Leaf, Droplet, ArrowRight } from 'lucide-react';

const phases = {
  menstrual: { name: 'Menstrual', Icon: Droplet },
  follicular: { name: 'Follicular', Icon: Leaf },
  ovulatory: { name: 'Ovulatory', Icon: Sun },
  luteal: { name: 'Luteal', Icon: Moon },
};

type PhaseKey = keyof typeof phases;

export function DashboardPeriodCard() {
  const [currentPhase, setCurrentPhase] = useState<PhaseKey | null>(null);
  const [lastCycleStart, setLastCycleStart] = useState<Date | null>(null);
  const [prediction, setPrediction] = useState<{ predictedStartDate: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching last cycle start date
    const fetchedDate = addDays(subMonths(new Date(), 1), 0);
    setLastCycleStart(fetchedDate);
    setPrediction({
      predictedStartDate: addDays(new Date(), 15).toISOString(),
    });
  }, []);

  useEffect(() => {
    if (lastCycleStart) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cycleDay = differenceInDays(today, lastCycleStart) + 1;

      if (cycleDay >= 1 && cycleDay <= 7) setCurrentPhase('menstrual');
      else if (cycleDay > 7 && cycleDay <= 13) setCurrentPhase('follicular');
      else if (cycleDay >= 14 && cycleDay <= 15) setCurrentPhase('ovulatory');
      else if (cycleDay > 15 && cycleDay <= 28) setCurrentPhase('luteal');
      else setCurrentPhase('luteal');
    } else {
      setCurrentPhase(null);
    }
  }, [lastCycleStart]);

  const phaseData = currentPhase ? phases[currentPhase] : null;

  if (!isClient) {
    // Render a loading state or null on the server to avoid hydration mismatch
    return null; 
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap />
          Your Cycle At a Glance
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {!lastCycleStart || !phaseData ? (
          <Alert>
            <AlertTitle>Welcome!</AlertTitle>
            <AlertDescription>
              Log your first period in the tracker to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <div className="flex items-center gap-3">
                {phaseData.Icon && <phaseData.Icon className="h-8 w-8 text-primary" />}
                <p className="text-xl font-semibold">{phaseData.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Predicted Period</p>
              <p className="text-xl font-semibold">
                {prediction ? new Date(prediction.predictedStartDate).toLocaleDateString() : 'Calculating...'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommendation</p>
              <p className="font-medium text-base">
                {currentPhase === 'menstrual' && 'During your menstrual phase, focus on iron-rich foods like spinach and lentils, stay hydrated, and consider foods rich in Vitamin C like oranges to help with iron absorption. Magnesium from nuts and seeds can help with cramps.'}
                {currentPhase === 'follicular' && "Your energy is rising! It's a great time for creative projects and socializing."}
                {currentPhase === 'ovulatory' && "You're at your peak! A good time for important meetings or high-intensity workouts."}
                {currentPhase === 'luteal' && 'Listen to your body. Prioritize self-care and calming activities.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/period-tracker">
            Go to Period Tracker <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
