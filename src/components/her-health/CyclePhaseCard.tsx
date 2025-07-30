'use client';

import { useState, useEffect } from 'react';
import { differenceInDays, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Zap, Moon, Sun, Leaf, Droplet } from 'lucide-react';

interface CyclePhaseCardProps {
  lastCycleStart?: Date;
}

const phases = {
  menstrual: {
    name: 'Menstrual Phase',
    duration: '3-7 days',
    Icon: Droplet,
    mood: 'May experience sadness, introspection, or irritability.',
    symptoms: 'Physical discomfort like cramps, fatigue, and bloating are common.',
    emotionalApproach: 'Feelings of fatigue, physical discomfort, and a desire to withdraw can be common.',
  },
  follicular: {
    name: 'Follicular Phase',
    duration: '1-14 days',
    Icon: Leaf,
    mood: 'Increased energy, sociability, clear-mindedness, and happiness are typical.',
    symptoms: 'Uterine lining thickens in preparation for potential pregnancy.',
    emotionalApproach: 'Increased well-being, a sense of optimism, and a desire for social interaction are often experienced.',
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    duration: 'Around day 14',
    Icon: Sun,
    mood: 'Elevated mood, increased libido, and heightened self-confidence are common.',
    symptoms: 'A mature egg is released, and estrogen levels peak.',
    emotionalApproach: 'Increased sensitivity and heightened emotions can occur.',
  },
  luteal: {
    name: 'Luteal Phase',
    duration: 'Days 15-28',
    Icon: Moon,
    mood: 'Can range from serenity to emotional turmoil, with increased anxiety, irritability, and potential for mood swings.',
    symptoms: 'Uterus lining thickens further in preparation for a potential pregnancy. If fertilization doesn\'t occur, the cycle restarts with menstruation.',
    emotionalApproach: 'Feelings can fluctuate from serenity to emotional distress, with some experiencing heightened sensitivity or difficulty concentrating.',
  },
};

type PhaseKey = keyof typeof phases;

export function CyclePhaseCard({ lastCycleStart }: CyclePhaseCardProps) {
  const [currentPhase, setCurrentPhase] = useState<PhaseKey | null>(null);

  useEffect(() => {
    if (lastCycleStart) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cycleDay = differenceInDays(today, lastCycleStart) + 1;

      if (cycleDay >= 1 && cycleDay <= 7) {
        setCurrentPhase('menstrual');
      } else if (cycleDay > 7 && cycleDay <= 13) {
        setCurrentPhase('follicular');
      } else if (cycleDay >= 14 && cycleDay <= 15) { // Ovulation is a short window
        setCurrentPhase('ovulatory');
      } else if (cycleDay > 15 && cycleDay <= 28) {
        setCurrentPhase('luteal');
      } else {
        // After day 28, it's likely pre-menstrual or the next cycle has started
        // but not logged yet. Default to luteal as it's the pre-menstrual phase.
        setCurrentPhase('luteal');
      }
    } else {
      setCurrentPhase(null);
    }
  }, [lastCycleStart]);

  const phaseData = currentPhase ? phases[currentPhase] : null;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap />
          Current Cycle Phase
        </CardTitle>
        <CardDescription>
          Understand your body's current hormonal phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!lastCycleStart || !phaseData ? (
          <Alert>
            <AlertTitle>Log Your Period</AlertTitle>
            <AlertDescription>
              Log your last period on the calendar to see your current cycle phase.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <phaseData.Icon className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{phaseData.name}</h3>
                <p className="text-sm text-muted-foreground">{phaseData.duration}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
                <p><strong>Mood:</strong> {phaseData.mood}</p>
                <p><strong>Symptoms:</strong> {phaseData.symptoms}</p>
                <p><strong>Emotional State:</strong> {phaseData.emotionalApproach}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
