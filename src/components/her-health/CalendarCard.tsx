
'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import type { PeriodPrediction } from './PeriodTracker';

interface CalendarCardProps {
  cycles: { start: Date; end: Date }[];
  prediction: PeriodPrediction | null;
  onLogPeriod: (range: DateRange | undefined) => void;
}

export function CalendarCard({ cycles, prediction, onLogPeriod }: CalendarCardProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  
  const periodDays = cycles.flatMap(cycle => {
    const days = [];
    let day = new Date(cycle.start);
    while (day <= cycle.end) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  });

  const predictedDays: Date[] = [];
  const flowDays: {
      light: Date[],
      medium: Date[],
      heavy: Date[],
  } = { light: [], medium: [], heavy: [] };

  if (prediction?.predictedStartDate) {
    const start = parseISO(prediction.predictedStartDate);
    for (let i = 0; i < 5; i++) { // Assume 5 days for predicted period
      const currentDay = addDays(start, i);
      predictedDays.push(currentDay);

      if (prediction.flowPrediction) {
          const flowForDay = prediction.flowPrediction.toLowerCase();
          
          if (i === 0 && flowForDay.includes("day 1: medium")) {
              flowDays.medium.push(currentDay);
          } else if (i === 1 && flowForDay.includes("day 2: heavy")) {
              flowDays.heavy.push(currentDay);
          } else if (i === 2 && flowForDay.includes("day 3: heavy")) {
              flowDays.heavy.push(currentDay);
          } else if (i === 3 && flowForDay.includes("day 4: medium")) {
              flowDays.medium.push(currentDay);
          } else if (i === 4 && flowForDay.includes("day 5: light")) {
              flowDays.light.push(currentDay);
          }
      }
    }
  }


  return (
    <Card className="h-full flex flex-col shadow-md">
      <CardHeader>
        <CardTitle>Cycle Calendar</CardTitle>
        <CardDescription>
          Select the start and end date of your period to log it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={setSelectedRange}
          numberOfMonths={1}
          modifiers={{
            period: periodDays,
            predicted: predictedDays,
            flowHeavy: flowDays.heavy,
            flowMedium: flowDays.medium,
            flowLight: flowDays.light,
          }}
          modifiersClassNames={{
            period: 'bg-destructive/80 text-destructive-foreground',
            predicted: 'bg-pink-200/50 text-pink-800',
            flowHeavy: 'bg-red-700 text-white',
            flowMedium: 'bg-red-500 text-white',
            flowLight: 'bg-red-300 text-white',
            today: 'border-2 border-accent rounded-full'
          }}
          className="p-0"
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 border-t pt-6">
         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive/80"></span>Logged Period</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-200/50"></span>Predicted Period</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-300"></span>Light Flow</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>Medium Flow</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-700"></span>Heavy Flow</div>
        </div>
        <Button onClick={() => onLogPeriod(selectedRange)} disabled={!selectedRange?.from || !selectedRange?.to} className="self-end">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Log Period
        </Button>
      </CardFooter>
    </Card>
  );
}
