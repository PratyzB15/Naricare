
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Zap, Moon, Sun, Leaf, Droplet, ArrowRight, Baby, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPregnancyProgressAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const phases = {
  menstrual: { name: 'Menstrual', Icon: Droplet, recommendation: "During your menstrual phase, focus on iron-rich foods like spinach and lentils, stay hydrated, and consider foods rich in Vitamin C like oranges to help with iron absorption. Magnesium from nuts and seeds can help with cramps." },
  follicular: { name: 'Follicular', Icon: Leaf, recommendation: "Your energy is rising! It's a great time for creative projects and socializing." },
  ovulatory: { name: 'Ovulatory', Icon: Sun, recommendation: "You're at your peak! A good time for important meetings or high-intensity workouts." },
  luteal: { name: 'Luteal', Icon: Moon, recommendation: "Listen to your body. Prioritize self-care and calming activities." },
};

type PhaseKey = keyof typeof phases;

type PregnancyInfo = {
    week: number;
    sizeComparison: string;
};

export function DashboardPeriodCard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Period State
  const [currentPhase, setCurrentPhase] = useState<PhaseKey | null>(null);
  const [lastCycleStart, setLastCycleStart] = useState<Date | null>(null);
  const [prediction, setPrediction] = useState<{ predictedStartDate: string } | null>(null);
  
  // Pregnancy State
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date | null>(null);
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);


  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      return;
    }
    
    // Check for pregnancy first
    const savedPregnancy = localStorage.getItem(`${email}_pregnancyStartDate`);
    if (savedPregnancy) {
        const startDate = new Date(savedPregnancy);
        setPregnancyStartDate(startDate);
        const weeks = Math.floor(differenceInDays(new Date(), startDate) / 7);
        
        if (weeks > 0 && weeks <= 42) {
             startTransition(async () => {
                try {
                    const result = await getPregnancyProgressAction({ pregnancyWeeks: weeks });
                    setPregnancyInfo({ week: weeks, sizeComparison: result.babySizeComparison });
                } catch (error) {
                     toast({
                        variant: 'destructive',
                        title: 'Pregnancy Info Error',
                        description: 'Could not fetch weekly pregnancy details.',
                    });
                }
            });
        }
        return; // Don't load period data if pregnant
    }

    // Load period data if not pregnant
    const savedCycles = localStorage.getItem(`${email}_periodCycles`);
    if (savedCycles) {
      const parsedCycles = JSON.parse(savedCycles).map((c: any) => ({ start: new Date(c.start), end: new Date(c.end) }));
      if (parsedCycles.length > 0) {
        setLastCycleStart(parsedCycles[parsedCycles.length-1].start);
      }
    }

    const savedPrediction = localStorage.getItem(`${email}_periodPrediction`);
    if(savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  useEffect(() => {
    if (lastCycleStart && !pregnancyStartDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cycleDay = differenceInDays(today, lastCycleStart) + 1;

      if (cycleDay >= 1 && cycleDay <= 7) setCurrentPhase('menstrual');
      else if (cycleDay > 7 && cycleDay <= 13) setCurrentPhase('follicular');
      else if (cycleDay >= 14 && cycleDay <= 15) setCurrentPhase('ovulatory');
      else if (cycleDay > 15 && cycleDay <= 28) setCurrentPhase('luteal');
      else setCurrentPhase('luteal'); // Default after day 28
    } else {
      setCurrentPhase(null);
    }
  }, [lastCycleStart, pregnancyStartDate]);

  const phaseData = currentPhase ? phases[currentPhase] : null;

  if (!isClient) {
    return <Card className="shadow-md h-full flex flex-col"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>;
  }
  
  if (pregnancyInfo) {
    return (
        <Card className="shadow-md h-full flex flex-col bg-teal-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-600">
                    <Baby />
                    Pregnancy Journey
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 {isPending ? (
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading weekly details...</span>
                     </div>
                 ) : (
                    <>
                        <div>
                            <p className="text-sm text-muted-foreground">Current Progress</p>
                            <p className="text-xl font-semibold">
                                You are {pregnancyInfo.week} weeks pregnant!
                            </p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Baby's Size</p>
                            <p className="text-xl font-semibold">
                                Your baby is about the size of a {pregnancyInfo.sizeComparison.toLowerCase()}.
                            </p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Recommendation</p>
                            <p className="font-medium text-base">
                                Head to the Pregnancy Tracker for a detailed look at your baby's development this week.
                            </p>
                        </div>
                    </>
                 )}
            </CardContent>
            <CardContent>
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                    <Link href="/pregnancy-baby-tracker">
                        View My Pregnancy <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
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
                {phaseData.recommendation}
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
