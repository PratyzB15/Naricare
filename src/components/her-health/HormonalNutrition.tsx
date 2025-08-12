'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2, Leaf, Utensils, HeartPulse, Moon, Sun, Droplet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getHormonalNutritionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { HormonalCycleNutritionOutput } from '@/ai/flows/hormonal-cycle-nutrition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicationReminderCard, type Medication } from './MedicationReminderCard';


const cycleFormSchema = z.object({
  cyclePhase: z.string().min(1, 'Please select your cycle phase.'),
  mood: z.string().optional(),
  physicalSymptoms: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  medicalHistory: z.string().optional(),
});

const pregnancyFormSchema = z.object({
  pregnancyTrimester: z.coerce.number().min(1).max(3),
  dietaryPreferences: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export function HormonalNutrition() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HormonalCycleNutritionOutput | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);


  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    setCurrentUserEmail(email);
    
    const savedMeds = localStorage.getItem(`${email}_medications`);
    if (savedMeds) {
        setMedications(JSON.parse(savedMeds));
    }
  }, [router]);
  
  useEffect(() => {
    if (!isClient || !currentUserEmail) return;
    localStorage.setItem(`${currentUserEmail}_medications`, JSON.stringify(medications));
  }, [medications, isClient, currentUserEmail]);

   // Water reminder effect
   useEffect(() => {
    if (!isClient) return;
    
    const waterReminderInterval = setInterval(() => {
        toast({
            title: "Hydration Reminder",
            description: "Time to drink a glass of water!",
        });
    }, 3 * 60 * 60 * 1000); // 3 hours in milliseconds

    return () => {
        clearInterval(waterReminderInterval);
    };
  }, [isClient, toast]);

  const cycleForm = useForm<z.infer<typeof cycleFormSchema>>({
    resolver: zodResolver(cycleFormSchema),
    defaultValues: { cyclePhase: 'menstruation', mood: '', physicalSymptoms: '', dietaryPreferences: '', medicalHistory: '' },
  });

  const pregnancyForm = useForm<z.infer<typeof pregnancyFormSchema>>({
    resolver: zodResolver(pregnancyFormSchema),
    defaultValues: { pregnancyTrimester: 1, dietaryPreferences: '', medicalHistory: '' },
  });

  const handleFormSubmit = (values: any, type: 'cycle' | 'pregnancy') => {
    setResult(null);
    startTransition(async () => {
      try {
        const input = type === 'pregnancy' ? { pregnancyTrimester: values.pregnancyTrimester, dietaryPreferences: values.dietaryPreferences, medicalHistory: values.medicalHistory } : values;
        const res = await getHormonalNutritionAction(input);
        setResult(res);
        toast({
          title: 'Recommendations Ready!',
          description: 'AI has generated your personalized nutrition advice.',
        });
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to Get Advice',
          description: 'Could not get recommendations at this time. Please try again later.',
        });
      }
    });
  };
  
  const renderRecommendations = (recommendations: string) => {
    const parts = recommendations.split(/(\*\*.*?\*\*)/g).filter(part => part.trim() !== '');
    return (
        <div className="space-y-4 text-sm">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <h4 key={index} className="font-bold text-md text-foreground">{part.replace(/\*\*/g, '')}</h4>;
                }
                const listItems = part.split('- ').filter(item => item.trim() !== '');
                return (
                    <ul key={index} className="list-disc list-inside text-muted-foreground space-y-1">
                        {listItems.map((item, i) => <li key={i}>{item.trim()}</li>)}
                    </ul>
                );
            })}
        </div>
    );
  };


  if (!isClient) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Leaf />
              Nutrition Advisor
            </CardTitle>
            <CardDescription>
              Get personalized diet & lifestyle advice based on your body's needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cycle" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cycle">Menstrual Cycle</TabsTrigger>
                <TabsTrigger value="pregnancy">Pregnancy</TabsTrigger>
              </TabsList>
              <TabsContent value="cycle" className="pt-4">
                <Form {...cycleForm}>
                  <form onSubmit={cycleForm.handleSubmit((values) => handleFormSubmit(values, 'cycle'))} className="space-y-4">
                    <FormField
                      control={cycleForm.control}
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
                              <SelectItem value="menstruation">Menstruation <Droplet className="inline-block h-4 w-4 ml-2" /></SelectItem>
                              <SelectItem value="follicular">Follicular <Leaf className="inline-block h-4 w-4 ml-2" /></SelectItem>
                              <SelectItem value="ovulation">Ovulation <Sun className="inline-block h-4 w-4 ml-2" /></SelectItem>
                              <SelectItem value="luteal">Luteal <Moon className="inline-block h-4 w-4 ml-2" /></SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={cycleForm.control} name="mood" render={({ field }) => (<FormItem><FormLabel>Current Mood (optional)</FormLabel><FormControl><Input placeholder="e.g., Happy, Anxious, Irritable" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={cycleForm.control} name="physicalSymptoms" render={({ field }) => (<FormItem><FormLabel>Physical Symptoms (optional)</FormLabel><FormControl><Textarea placeholder="e.g., cramps, bloating, headaches" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={cycleForm.control} name="dietaryPreferences" render={({ field }) => (<FormItem><FormLabel>Dietary Preferences (optional)</FormLabel><FormControl><Input placeholder="e.g., Vegan, Gluten-free" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={cycleForm.control} name="medicalHistory" render={({ field }) => (<FormItem><FormLabel>Medical History (optional)</FormLabel><FormControl><Input placeholder="e.g., PCOS, Thyroid issues" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4" />}
                      Get Cycle Advice
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="pregnancy" className="pt-4">
                <Form {...pregnancyForm}>
                  <form onSubmit={pregnancyForm.handleSubmit((values) => handleFormSubmit(values, 'pregnancy'))} className="space-y-4">
                    <FormField
                      control={pregnancyForm.control}
                      name="pregnancyTrimester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Trimester</FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a trimester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1st Trimester</SelectItem>
                              <SelectItem value="2">2nd Trimester</SelectItem>
                              <SelectItem value="3">3rd Trimester</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={pregnancyForm.control} name="dietaryPreferences" render={({ field }) => (<FormItem><FormLabel>Dietary Preferences (optional)</FormLabel><FormControl><Input placeholder="e.g., Vegetarian, Low-carb" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={pregnancyForm.control} name="medicalHistory" render={({ field }) => (<FormItem><FormLabel>Medical History (optional)</FormLabel><FormControl><Input placeholder="e.g., Gestational Diabetes" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4" />}
                      Get Pregnancy Advice
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <MedicationReminderCard medications={medications} setMedications={setMedications} />

      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BrainCircuit />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Here is your personalized advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {isPending && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {result ? (
            renderRecommendations(result.recommendations)
          ) : (
            !isPending && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your personalized recommendations will appear here after you submit the form.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
