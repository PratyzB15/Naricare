'use client';

import { useState, useEffect, useTransition } from 'react';
import type { DateRange } from 'react-day-picker';
import { differenceInDays, formatISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarCard } from '@/components/her-health/CalendarCard';
import { CyclePhaseCard } from '@/components/her-health/CyclePhaseCard';
import { predictPeriodAction } from '@/app/actions';
import { AlertTriangle, HeartPulse, Info, Droplet, Baby } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export type PeriodCycle = { 
  start: Date; 
  end: Date;
};

export type PeriodPrediction = {
  predictedStartDate: string;
  confidence: number;
  reasoning: string;
  healthAnalysis?: string;
  flowPrediction?: string;
};

export function PeriodTracker() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPredicting, startPredictionTransition] = useTransition();
  const [userProfile, setUserProfile] = useState({ age: null, medicalHistory: '' }); 
  const [isClient, setIsClient] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [prediction, setPrediction] = useState<PeriodPrediction | null>(null);
  const [flowFeedback, setFlowFeedback] = useState('');
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    setCurrentUserEmail(email);

    // Load data from localStorage to simulate a logged-in user
    const savedProfile = localStorage.getItem(`${email}_userProfile`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    const savedCycles = localStorage.getItem(`${email}_periodCycles`);
    if (savedCycles) {
      const parsedCycles = JSON.parse(savedCycles).map((c: any) => ({ ...c, start: new Date(c.start), end: new Date(c.end) }));
      setCycles(parsedCycles);
    }
    
    const savedPregnancy = localStorage.getItem(`${email}_pregnancyStartDate`);
    if (savedPregnancy) {
        setPregnancyStartDate(new Date(savedPregnancy));
    }

  }, [router]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isClient || !currentUserEmail) return;
    localStorage.setItem(`${currentUserEmail}_periodCycles`, JSON.stringify(cycles));
    if (prediction) {
      localStorage.setItem(`${currentUserEmail}_periodPrediction`, JSON.stringify(prediction));
    }
    if (pregnancyStartDate) {
        localStorage.setItem(`${currentUserEmail}_pregnancyStartDate`, pregnancyStartDate.toISOString());
    } else {
        localStorage.removeItem(`${currentUserEmail}_pregnancyStartDate`);
    }
  }, [cycles, prediction, pregnancyStartDate, isClient, currentUserEmail]);
  

  const handlePrediction = (newCycles: PeriodCycle[]) => {
    if(newCycles.length === 0 || pregnancyStartDate) return;

    startPredictionTransition(async () => {
      try {
        const pastCycleData = newCycles.map(c => ({
            start: formatISO(c.start, { representation: 'date' }),
            end: formatISO(c.end, { representation: 'date' }),
        }));

        const result = await predictPeriodAction({
          pastCycleData,
          mood: 'calm',
          physicalSymptoms: 'None',
          age: userProfile.age || undefined,
          medicalHistory: userProfile.medicalHistory
        });
        setPrediction(result);
        if (result) {
            toast({
              title: 'Prediction Updated',
              description: 'Your next period has been predicted based on your latest cycle.',
            });
        }
      } catch (error) {
        console.error('Auto-prediction failed:', error);
        toast({
            variant: 'destructive',
            title: 'Prediction Error',
            description: 'Could not get prediction at this time. Please try again later.',
        });
      }
    });
  };

  useEffect(() => {
    if(isClient && cycles.length > 0 && currentUserEmail) {
        const savedPrediction = localStorage.getItem(`${currentUserEmail}_periodPrediction`);
        if (savedPrediction) {
          setPrediction(JSON.parse(savedPrediction));
        } else {
            handlePrediction(cycles);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles.length, isClient, currentUserEmail]); // Depend on length to re-trigger on add/remove

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
      const newCycle: PeriodCycle = { start: range.from, end: range.to };
      const updatedCycles = [...cycles, newCycle].sort((a, b) => a.start.getTime() - b.start.getTime());
      setCycles(updatedCycles);
      toast({
        title: 'Cycle Logged',
        description: `Your period from ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()} has been logged.`,
      });
      handlePrediction(updatedCycles);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Logging Period',
        description: 'Please select a start and end date for your period.',
      });
    }
  };
  
  const lastCycle = cycles.length > 0 ? cycles[cycles.length - 1] : undefined;
  const cycleHistory = cycles.slice().reverse();
  const pregnancyWeeks = pregnancyStartDate ? Math.floor(differenceInDays(new Date(), pregnancyStartDate) / 7) : null;


  if (!isClient || !currentUserEmail) {
      return null;
  }
  
  if (pregnancyWeeks !== null && pregnancyWeeks < 50) {
      return (
         <div className="lg:col-span-3">
             <Alert>
                <Baby className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2 text-2xl">
                    Pregnancy Mode
                </AlertTitle>
                <AlertDescription>
                   Period tracking is paused during your pregnancy. You are approximately {pregnancyWeeks} weeks pregnant.
                </AlertDescription>
                <CardContent className="pt-4 px-0">
                    <p>Congratulations! Your period tracker is paused. Head over to the Pregnancy & Baby Tracker for weekly updates on your baby's development.</p>
                </CardContent>
             </Alert>
         </div>
      );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <CalendarCard
          cycles={cycles}
          prediction={prediction}
          onLogPeriod={handleLogPeriod}
        />
        {prediction?.flowPrediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet />
                Predicted Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{prediction.flowPrediction}</p>
              <div className="pt-4">
                <CardDescription className="mb-2">Did your flow match the prediction? Let us know to improve future predictions.</CardDescription>
                <Textarea
                  placeholder="e.g., 'My flow was heavier on the first day than predicted.'"
                  value={flowFeedback}
                  onChange={(e) => setFlowFeedback(e.target.value)}
                />
                <Button className="mt-2" size="sm">Submit Feedback</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        {prediction?.healthAnalysis && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle />
                Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{prediction.healthAnalysis}</p>
            </CardContent>
          </Card>
        )}
        
        <CyclePhaseCard lastCycleStart={lastCycle?.start} />
        
        {cycleHistory.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Info />
                        Cycle History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                        {cycleHistory.map((cycle, index) => (
                             <li key={index}>Cycle {cycleHistory.length - index}: {cycle.start.toLocaleDateString()} - {cycle.end.toLocaleDateString()}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
        
        {prediction && !prediction.healthAnalysis && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartPulse />
                        Prediction Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Reasoning:</strong> {prediction.reasoning}</p>
                    <p><strong>Confidence:</strong> {Math.round(prediction.confidence * 100)}%</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
