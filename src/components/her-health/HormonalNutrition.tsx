'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Nut, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getHormonalNutritionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { HormonalCycleNutritionOutput } from '@/ai/flows/hormonal-cycle-nutrition';

const formSchema = z.object({
  cyclePhase: z.string().min(1, 'Please select your cycle phase.'),
  mood: z.string().optional(),
  physicalSymptoms: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export function HormonalNutrition() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HormonalCycleNutritionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cyclePhase: 'menstruation',
      mood: '',
      physicalSymptoms: '',
      dietaryPreferences: '',
      medicalHistory: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await getHormonalNutritionAction(values);
        setResult(res);
      } catch (error) {
        console.error('Nutrition advice failed:', error);
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: 'Could not get nutrition advice. Please try again later.',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Nut />
            AI-Powered Nutrition Advisor
          </CardTitle>
          <CardDescription>
            Get personalized diet and nutrition recommendations based on your current hormonal cycle phase, mood, and symptoms.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cyclePhase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Cycle Phase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="menstruation">Menstruation</SelectItem>
                          <SelectItem value="follicular">Follicular</SelectItem>
                          <SelectItem value="ovulation">Ovulation</SelectItem>
                          <SelectItem value="luteal">Luteal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Mood</FormLabel>
                      <FormControl><Input placeholder="e.g., happy, calm, irritable" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="physicalSymptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Symptoms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., cramps, bloating, fatigue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., vegetarian, gluten-free" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Medical History</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PCOS, thyroid issues" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Get Advice
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {isPending && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
             <p className="ml-4 text-muted-foreground">Generating your personalized plan...</p>
          </div>
        )}

      {result && (
        <Card className="shadow-lg border-accent/30 animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent"/>
              Your Personalized Nutrition Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground">
                <p>{result.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
