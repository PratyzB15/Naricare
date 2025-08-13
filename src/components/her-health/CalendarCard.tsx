
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
    const flowString = prediction.flowPrediction || '';

    // A more robust way to parse the flow string
    const flowMap: { [key: string]: 'light' | 'medium' | 'heavy' } = {};
    flowString.split(',').forEach(part => {
        const match = part.trim().match(/Day (\d+): (Light|Medium|Heavy)/i);
        if (match) {
            const dayNum = parseInt(match[1], 10);
            const intensity = match[2].toLowerCase() as 'light' | 'medium' | 'heavy';
            flowMap[dayNum] = intensity;
        }
    });

    // Default to 5 days if parsing fails but a date exists
    const predictedPeriodLength = Object.keys(flowMap).length > 0 ? Object.keys(flowMap).length : 5;

    for (let i = 0; i < predictedPeriodLength; i++) {
      const currentDay = addDays(start, i);
      predictedDays.push(currentDay);
      
      const dayNum = i + 1;
      const intensity = flowMap[dayNum];

      if (intensity === 'light') {
          flowDays.light.push(currentDay);
      } else if (intensity === 'medium') {
          flowDays.medium.push(currentDay);
      } else if (intensity === 'heavy') {
          flowDays.heavy.push(currentDay);
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
            today: 'border-2 border-primary rounded-full'
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
