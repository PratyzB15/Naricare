'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import type { PeriodPrediction } from './PeriodPredictionCard';

interface CalendarCardProps {
  cycles: { start: Date; end: Date }[];
  prediction: PeriodPrediction | null;
  onLogPeriod: (range: DateRange | undefined) => void;
}

export function CalendarCard({ cycles, prediction, onLogPeriod }: CalendarCardProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  
  const periodDays = cycles.flatMap(cycle => {
    const days = [];
    let day = cycle.start;
    while (day <= cycle.end) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  });

  const predictedDays: Date[] = [];
  if (prediction?.predictedStartDate) {
    const start = new Date(prediction.predictedStartDate);
    for (let i = 0; i < 5; i++) { // Assume 5 days for predicted period
      predictedDays.push(addDays(start, i));
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
          }}
          modifiersClassNames={{
            period: 'bg-destructive text-destructive-foreground',
            predicted: 'bg-pink-200 text-pink-800',
            today: 'border-2 border-accent rounded-full'
          }}
          className="p-0"
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-6">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive"></span>Logged Period</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-200"></span>Predicted</div>
        </div>
        <Button onClick={() => onLogPeriod(selectedRange)} disabled={!selectedRange?.from || !selectedRange?.to}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Log Period
        </Button>
      </CardFooter>
    </Card>
  );
}
