
'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, HardHat, HeartPulse, Leaf, Loader2, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { detectLaborDiseaseAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';

const laborSymptoms = [
  { id: 'skin_patches', label: 'Dark/light “raindrop” skin patches, thick palms/soles, wart-like growths, brittle nails' },
  { id: 'dental_issues', label: 'Brown-stained teeth, bent legs, joint stiffness' },
  { id: 'skin_rash', label: 'Redness, itching, blistering on skin' },
  { id: 'sun_rash', label: 'Rash that worsens in sunlight, dark patches' },
  { id: 'chemical_burns', label: 'Blisters, blackened skin from chemical spillage' },
  { id: 'hand_eczema', label: 'Thickened, cracked skin on palms/fingers' },
  { id: 'varicose_veins', label: 'Twisted, enlarged leg veins' },
  { id: 'eye_growth', label: 'Fleshy growth on the eye' },
  { id: 'eye_irritation', label: 'Red, watery eyes after chemical exposure' },
  { id: 'fungal_infection', label: 'Circular red rashes, peeling skin' },
  { id: 'hair_loss', label: 'Hair loss patches, scalp irritation' },
  { id: 'non_healing_ulcer', label: 'A non-healing ulcer or scaly patch on skin' },
  { id: 'hyperpigmentation', label: 'Uneven dark patches on skin from sun' },
  { id: 'nail_fungus', label: 'Thick, discolored nails' },
  { id: 'calluses', label: 'Thick, hard skin on palms, soles, or knuckles' },
  { id: 'posture_issues', label: 'Stooped/hunched back, uneven shoulders' },
  { id: 'joint_swelling', label: 'Swollen joints (knees, wrists, elbows)' },
  { id: 'pale_skin', label: 'Pale skin, brittle nails, fatigue' },
  { id: 'heat_rash', label: 'Small red itchy bumps on neck or chest' },
  { id: 'dehydration', label: 'Dry lips, dizziness, flushed face' },
  { id: 'back_pain', label: 'Visible stooping, chronic back stiffness' },
  { id: 'skin_cracks', label: 'Deep painful cracks in hands or feet' },
  { id: 'skin_stains', label: 'Dark stains on skin from cement or coal dust' },
  { id: 'weak_grip', label: 'Swelling in wrist, weak grip' },
  { id: 'cement_allergy', label: 'Itchy rashes, skin peeling from cement/lime contact' },
  { id: 'dusty_eyes', label: 'Red, watery eyes from dust/smoke exposure' },
  { id: 'friction_blisters', label: 'Fluid-filled bubbles on hands/feet' },
];

const malnutritionSymptoms = [
  { id: 'thin_frame', label: 'Thin, bony frame with little muscle mass' },
  { id: 'hollow_cheeks', label: 'Hollow cheeks and sunken eyes' },
  { id: 'brittle_hair', label: 'Brittle hair or hair loss' },
  { id: 'dry_skin', label: 'Dry, cracked skin' },
  { id: 'swollen_ankles', label: 'Swollen ankles or feet' },
  { id: 'slow_healing', label: 'Delayed wound healing' },
  { id: 'pale_skin_lips', label: 'Pale skin and lips' },
];


const formSchema = z.object({
  symptoms: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'Please select at least one symptom.',
  }),
});

const malnutritionFormSchema = z.object({
    height: z.coerce.number().positive("Height must be positive."),
    weight: z.coerce.number().positive("Weight must be positive."),
    signs: z.array(z.string()).optional(),
});

const weightRanges = [
    { height: 145, min: 39 },
    { height: 150, min: 42 },
    { height: 155, min: 45 },
    { height: 160, min: 47 },
    { height: 165, min: 50 },
    { height: 170, min: 54 },
];

type AnalysisResult = {
  disease: string;
  cause: string;
  prevention: string;
  medication: string;
};

type MalnutritionResult = {
    isMalnourished: boolean;
    message: string;
    checkedSigns: string[];
}

export function OccupationalHealth() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [malnutritionResult, setMalnutritionResult] = useState<MalnutritionResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { symptoms: [] },
  });

  const malnutritionForm = useForm<z.infer<typeof malnutritionFormSchema>>({
    resolver: zodResolver(malnutritionFormSchema),
    defaultValues: { 
        signs: [],
        height: undefined,
        weight: undefined
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await detectLaborDiseaseAction({ symptoms: values.symptoms });
        setResult(res);
        toast({ title: 'Analysis Complete', description: 'AI has analyzed your report.' });
      } catch (error) {
        console.error('Failed to get analysis:', error);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not get analysis. Please try again.' });
      }
    });
  };

  const onMalnutritionSubmit = (values: z.infer<typeof malnutritionFormSchema>) => {
    const { height, weight, signs } = values;
    let closestHeight = weightRanges[0];
    for (const range of weightRanges) {
        if (Math.abs(range.height - height) < Math.abs(closestHeight.height - height)) {
            closestHeight = range;
        }
    }
    
    const isMalnourished = weight < closestHeight.min;
    const message = isMalnourished 
        ? `Based on your height of approximately ${closestHeight.height}cm, your weight is below the healthy minimum of ${closestHeight.min}kg. It is highly recommended to consult a doctor and focus on a nutrient-rich diet.`
        : `Based on your height of approximately ${closestHeight.height}cm, your weight is within a healthy range. Keep up the good work!`;

    setMalnutritionResult({ isMalnourished, message, checkedSigns: signs || []});
  }

  return (
    <Tabs defaultValue="disease-checker" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="disease-checker"><HardHat className="mr-2 h-4 w-4" />Labor Disease Checker</TabsTrigger>
        <TabsTrigger value="malnutrition"><HeartPulse className="mr-2 h-4 w-4" />Malnutrition Check</TabsTrigger>
      </TabsList>
      <TabsContent value="disease-checker">
        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Checker</CardTitle>
              <CardDescription>Select any symptoms you're experiencing to get an AI-powered analysis.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={() => (
                      <FormItem>
                        {laborSymptoms.map((symptom) => (
                          <FormField
                            key={symptom.id}
                            control={form.control}
                            name="symptoms"
                            render={({ field }) => (
                              <FormItem key={symptom.id} className="flex flex-row items-start space-x-3 space-y-0 my-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(symptom.label)}
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([...field.value, symptom.label])
                                        : field.onChange(field.value?.filter((v) => v !== symptom.label))
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{symptom.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Analyze Symptoms
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>AI Analysis Result</CardTitle>
               <CardDescription>View the potential condition based on your symptoms.</CardDescription>
            </CardHeader>
            <CardContent>
                {isPending && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</div>}
                {result ? (
                    <div className="space-y-4">
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>{result.disease}</AlertTitle>
                        </Alert>
                         <div>
                            <h4 className="font-semibold text-base">Potential Cause</h4>
                            <p className="text-sm text-muted-foreground">{result.cause}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-base">Prevention</h4>
                            <p className="text-sm text-muted-foreground">{result.prevention}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-base">Medication / First Aid</h4>
                            <p className="text-sm text-muted-foreground">{result.medication}</p>
                        </div>
                         <p className="text-xs text-muted-foreground pt-4">This is an AI-powered suggestion and not a medical diagnosis. Please consult a qualified doctor for any health concerns.</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        Your analysis result will appear here.
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
       <TabsContent value="malnutrition">
         <div className="grid md:grid-cols-2 gap-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Check for Malnutrition</CardTitle>
                    <CardDescription>Enter your height and weight, and check any visible signs you notice.</CardDescription>
                </CardHeader>
                 <Form {...malnutritionForm}>
                    <form onSubmit={malnutritionForm.handleSubmit(onMalnutritionSubmit)}>
                        <CardContent className="space-y-4">
                             <FormField
                                control={malnutritionForm.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Height (in cm)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 155" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={malnutritionForm.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Weight (in kg)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 48" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={malnutritionForm.control}
                                name="signs"
                                render={() => (
                                <FormItem>
                                    <FormLabel className="font-semibold pt-2">Visible Signs (optional)</FormLabel>
                                    {malnutritionSymptoms.map((symptom) => (
                                    <FormField
                                        key={symptom.id}
                                        control={malnutritionForm.control}
                                        name="signs"
                                        render={({ field }) => (
                                        <FormItem key={symptom.id} className="flex flex-row items-start space-x-3 space-y-0 my-2">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(symptom.label)}
                                                onCheckedChange={(checked) =>
                                                checked
                                                    ? field.onChange([...(field.value || []), symptom.label])
                                                    : field.onChange(field.value?.filter((v) => v !== symptom.label))
                                                }
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">{symptom.label}</FormLabel>
                                        </FormItem>
                                        )}
                                    />
                                    ))}
                                </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Check My Status</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Nutrition Analysis</CardTitle>
                    <CardDescription>Your nutritional status based on your inputs.</CardDescription>
                </CardHeader>
                <CardContent>
                    {malnutritionResult ? (
                        <div className="space-y-4">
                            <Alert variant={malnutritionResult.isMalnourished ? "destructive" : "default"}>
                                <AlertTitle>{malnutritionResult.isMalnourished ? "Potential Malnutrition Detected" : "Healthy Weight Range"}</AlertTitle>
                                <AlertDescription>{malnutritionResult.message}</AlertDescription>
                            </Alert>
                            {malnutritionResult.checkedSigns.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-base">Selected Signs:</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {malnutritionResult.checkedSigns.map(sign => <li key={sign}>{sign}</li>)}
                                    </ul>
                                    <p className="text-xs text-muted-foreground mt-2">The presence of these signs along with low weight can indicate nutritional deficiencies. Please consult a doctor.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-16">
                            Your analysis will appear here.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
