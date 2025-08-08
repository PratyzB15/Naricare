'use client';

import { useState, useEffect, useTransition } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, differenceInDays, formatISO, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarCard } from '@/components/her-health/CalendarCard';
import { CyclePhaseCard } from '@/components/her-health/CyclePhaseCard';
import { MedicationReminderCard } from '@/components/her-health/MedicationReminderCard';
import type { Medication } from '@/components/her-health/MedicationReminderCard';
import { predictPeriodAction } from '@/app/actions';
import { AlertTriangle, HeartPulse, Info, Droplet, Pregnant } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export type PeriodCycle = { start: Date; end: Date };

export type PeriodPrediction = {
  predictedStartDate: string;
  confidence: number;
  reasoning: string;
  healthAnalysis?: string;
  flowPrediction?: string;
};

export function PeriodTracker() {
  const { toast } = useToast();
  const [isPredicting, startPredictionTransition] = useTransition();
  const [userProfile, setUserProfile] = useState({ age: 30, medicalHistory: 'None' }); 
  const [isClient, setIsClient] = useState(false);
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [prediction, setPrediction] = useState<PeriodPrediction | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [flowFeedback, setFlowFeedback] = useState('');
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Load data from localStorage to simulate a logged-in user
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    const savedCycles = localStorage.getItem('periodCycles');
    if (savedCycles) {
      const parsedCycles = JSON.parse(savedCycles).map((c: any) => ({ start: new Date(c.start), end: new Date(c.end) }));
      setCycles(parsedCycles);
    } else {
        // Initialize with some default data if nothing is saved
        setCycles([
            { start: subMonths(new Date(), 2), end: addDays(subMonths(new Date(), 2), 4) },
            { start: subMonths(new Date(), 1), end: addDays(subMonths(new Date(), 1), 5) },
        ]);
    }
    
    const savedMeds = localStorage.getItem('medications');
    if (savedMeds) {
        setMedications(JSON.parse(savedMeds));
    } else {
        setMedications([{ id: '1', name: 'Iron Supplement', time: '09:00' }]);
    }
    
    const savedPregnancy = localStorage.getItem('pregnancyStartDate');
    if (savedPregnancy) {
        setPregnancyStartDate(new Date(savedPregnancy));
    }

  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('periodCycles', JSON.stringify(cycles));
    localStorage.setItem('medications', JSON.stringify(medications));
    if (prediction) {
      localStorage.setItem('periodPrediction', JSON.stringify(prediction));
    }
    if (pregnancyStartDate) {
        localStorage.setItem('pregnancyStartDate', pregnancyStartDate.toISOString());
    }
  }, [cycles, medications, prediction, pregnancyStartDate, isClient]);

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
          age: userProfile.age,
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
    if(isClient && cycles.length > 0) {
        handlePrediction(cycles);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, isClient]);

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
  const cycleHistory = cycles.slice(-2);

  if (!isClient) {
      return null;
  }
  
  if (pregnancyStartDate) {
      const pregnancyWeeks = differenceInDays(new Date(), pregnancyStartDate) / 7;
      return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Pregnant /> Pregnancy Mode
                </CardTitle>
                <CardDescription>
                   Period tracking is paused during your pregnancy. You are approximately {Math.floor(pregnancyWeeks)} weeks pregnant.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Congratulations! Your period tracker is paused. Head over to the Pregnancy & Baby Tracker for weekly updates on your baby's development.</p>
                <Button className="mt-4" onClick={() => setPregnancyStartDate(null)}>End Pregnancy</Button>
            </CardContent>
        </Card>
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
        <div className="grid md:grid-cols-2 gap-6">
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
            <MedicationReminderCard
                medications={medications}
                setMedications={setMedications}
            />
        </div>
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
                    <ul className="space-y-2 text-sm">
                        {cycleHistory.map((cycle, index) => (
                             <li key={index}>
                                {`Month ${index + 1}: ${cycle.start.toLocaleDateString()} - ${cycle.end.toLocaleDateString()}`}
                            </li>
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
