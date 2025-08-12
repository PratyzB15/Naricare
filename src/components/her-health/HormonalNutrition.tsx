'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2, Info, Leaf, Utensils, Baby } from 'lucide-react';
import { differenceInDays } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getHormonalNutritionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export type HormonalNutritionResult = {
  recommendations: string;
};

const formSchema = z.object({
  cyclePhase: z.string().min(1, 'Please select your cycle phase.'),
  mood: z.string().optional(),
  physicalSymptoms: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  medicalHistory: z.string().optional(),
});

const ageBasedAdvice: { [key: string]: string } = {
    '18-35': 'During these high-energy years, focus on a diet rich in iron (leafy greens, lentils) to combat anemia, calcium (dairy, ragi) for bone density, and adequate protein for muscle strength. Hydration is key to managing the high physical demands.',
    '36-50': 'As your body changes, prioritize anti-inflammatory foods like turmeric, ginger, and berries to manage joint pain. Ensure you get enough Vitamin D and calcium to support bone health. Omega-3 fatty acids from fish or flaxseeds can help with joint stiffness.',
    '50+': 'Post-menopause, bone health is critical. A diet rich in calcium and Vitamin D is essential to prevent osteoporosis. Light, regular exercise can help maintain flexibility and prevent a stooped posture. Focus on a protein-rich diet to maintain muscle mass.'
};

const trimesterAdvice: { [key: string]: string } = {
    '1': 'First Trimester (Weeks 1-13): Focus on folate-rich foods like lentils, leafy greens, and fortified cereals to prevent birth defects. Ginger and peppermint can help with morning sickness. Stay hydrated and eat small, frequent meals.',
    '2': 'Second Trimester (Weeks 14-27): Your energy is likely returning! Increase your intake of iron (lean meats, beans), calcium (dairy, tofu), and Vitamin D (fatty fish, fortified milk) for your baby\'s growing bones and your own health.',
    '3': 'Third Trimester (Weeks 28-40+): Your baby is growing rapidly. Prioritize protein (eggs, nuts, chicken) and Omega-3 fatty acids (salmon, walnuts) for brain development. Eat fiber-rich foods to prevent constipation and continue with iron and calcium intake.'
};


export function HormonalNutrition() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HormonalNutritionResult | null>(null);
  const [ageAdvice, setAgeAdvice] = useState<string | null>(null);
  const [trimesterInfo, setTrimesterInfo] = useState<{trimester: number, advice: string} | null>(null);
  const [isPregnant, setIsPregnant] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    const profile = JSON.parse(localStorage.getItem(`${email}_userProfile`) || '{}');
    if (profile.age) {
        if (profile.age >= 18 && profile.age <= 35) {
            setAgeAdvice(ageBasedAdvice['18-35']);
        } else if (profile.age >= 36 && profile.age <= 50) {
            setAgeAdvice(ageBasedAdvice['36-50']);
        } else if (profile.age > 50) {
            setAgeAdvice(ageBasedAdvice['50+']);
        }
    }
    
    const savedPregnancy = localStorage.getItem(`${email}_pregnancyStartDate`);
    if (savedPregnancy) {
        setIsPregnant(true);
        const startDate = new Date(savedPregnancy);
        const weeks = Math.floor(differenceInDays(new Date(), startDate) / 7);
        if (weeks <= 13) {
            setTrimesterInfo({ trimester: 1, advice: trimesterAdvice['1']});
        } else if (weeks <= 27) {
            setTrimesterInfo({ trimester: 2, advice: trimesterAdvice['2']});
        } else {
            setTrimesterInfo({ trimester: 3, advice: trimesterAdvice['3']});
        }
    }

  }, [router]);


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

  return (
    <div className="grid md:grid-cols-2 gap-8">
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Leaf />
          Nutrition Advisor
        </CardTitle>
        <CardDescription>
          Get personalized diet & lifestyle advice.
        </CardDescription>
      </CardHeader>
      {!isPregnant && (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                    <FormLabel>Current Mood (optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Happy, Anxious, Irritable" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="physicalSymptoms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Physical Symptoms (optional)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., cramps, bloating, headaches" {...field} />
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
                    <FormLabel>Dietary Preferences (optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Vegan, Gluten-free" {...field} />
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
                    <FormLabel>Medical History (optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., PCOS, Thyroid issues" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get My Recommendations
                </Button>
            </CardFooter>
            </form>
        </Form>
      )}
     
      {result && (
        <CardContent className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Utensils /> AI Recommendations</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {result.recommendations.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      )}

      {isPregnant && trimesterInfo && (
          <CardContent>
              <Card className="shadow-inner bg-teal-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-700">
                        <Baby />
                        Trimester {trimesterInfo.trimester} Nutrition
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{trimesterInfo.advice}</p>
                </CardContent>
              </Card>
          </CardContent>
      )}

    </Card>
    {ageAdvice && (
        <Card className="shadow-md bg-secondary/30">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                <Info />
                Age-Based Nutritional Guidance
                </CardTitle>
                <CardDescription>
                Special considerations for your current life stage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{ageAdvice}</p>
            </CardContent>
        </Card>
    )}
    </div>
  );
}
