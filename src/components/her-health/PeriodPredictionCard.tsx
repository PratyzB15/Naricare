'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2, Info } from 'lucide-react';
import { format, formatISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { predictPeriodAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export type PeriodPrediction = {
  predictedStartDate: string;
  confidence: number;
  reasoning: string;
};

interface PeriodPredictionCardProps {
  cycles: { start: Date; end: Date }[];
  onPrediction: (prediction: PeriodPrediction | null) => void;
  isPredicting: boolean;
}

const formSchema = z.object({
  mood: z.string().min(1, 'Please select your mood.'),
  physicalSymptoms: z.string().min(3, 'Please describe any symptoms.').max(200),
});

export function PeriodPredictionCard({ cycles, onPrediction, isPredicting }: PeriodPredictionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [predictionResult, setPredictionResult] = useState<PeriodPrediction | null>(null);
  const { toast } = useToast();
  const hasLoggedCycles = cycles.length > 0;


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: 'calm',
      physicalSymptoms: 'None',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setPredictionResult(null);
    onPrediction(null);
    startTransition(async () => {
      try {
        if (!hasLoggedCycles) {
            toast({
                variant: 'destructive',
                title: 'Prediction Error',
                description: 'Please log at least one period cycle to get a prediction.',
            });
            return;
        }
        const pastCycleData = cycles.map(c => formatISO(c.start, { representation: 'date' }));
        const result = await predictPeriodAction({ ...values, pastCycleData });
        setPredictionResult(result);
        onPrediction(result);
      } catch (error) {
        console.error('Prediction failed:', error);
        toast({
            variant: 'destructive',
            title: 'Prediction Failed',
            description: 'Could not get a prediction at this time. Please try again later.',
        });
      }
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit />
          Period Prediction
        </CardTitle>
        <CardDescription>
          Enter your current mood and symptoms for a more accurate AI-powered prediction.
        </CardDescription>
      </CardHeader>
      {!hasLoggedCycles ? (
         <CardContent>
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Log Your First Cycle</AlertTitle>
                <AlertDescription>
                    Please log your last period on the calendar to enable predictions.
                </AlertDescription>
            </Alert>
         </CardContent>
      ) : (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Mood</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="irritable">Irritable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="physicalSymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Symptoms</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., cramps, bloating, headaches" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending || isPredicting}>
              {(isPending || isPredicting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Predict Next Period
            </Button>
          </CardFooter>
        </form>
      </Form>
      )}
      {predictionResult && (
        <CardContent className="border-t pt-6">
          <h4 className="font-semibold mb-2">Prediction Result:</h4>
          <p>
            <strong>Next Period:</strong> {format(new Date(predictionResult.predictedStartDate), 'MMMM d, yyyy')}
          </p>
          <p>
            <strong>Confidence:</strong> {Math.round(predictionResult.confidence * 100)}%
          </p>
          <div className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
            <Info className="w-4 h-4 mt-1 shrink-0" />
            <p><strong>AI Reasoning:</strong> {predictionResult.reasoning}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
