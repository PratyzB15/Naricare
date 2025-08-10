'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, BrainCircuit, HeartPulse, Loader2, Ribbon, Upload, X, ClipboardCheck, Siren, Stethoscope, FileImage } from 'lucide-react';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { breastCancerAnalysisAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';

const breastSymptoms = [
  { id: 'lump', label: 'Lump or thickened area in the breast or underarm' },
  { id: 'lump_growth', label: 'If the lump is growing day by day' },
  { id: 'size_shape_change', label: 'Change in breast size or shape' },
  { id: 'skin_dimpling', label: 'Skin dimpling, puckering, or “orange peel” texture' },
  { id: 'nipple_inversion', label: 'Nipple inversion (if new)' },
  { id: 'skin_redness', label: 'Redness, rash, or swelling of skin' },
  { id: 'nipple_discharge', label: 'Unusual nipple discharge (bloody or clear, not milky)' },
  { id: 'persistent_pain', label: 'Persistent pain in one area' },
];

const ovarianSymptoms = [
  { id: 'bloating', label: 'Persistent bloating or swelling of the belly' },
  { id: 'pelvic_pain', label: 'Pelvic or lower abdominal pain/pressure' },
  { id: 'feeling_full', label: 'Feeling full quickly or loss of appetite' },
  { id: 'urinary_changes', label: 'Frequent or urgent need to urinate, or pain while urinating (without infection)' },
  { id: 'period_changes', label: 'Irregular periods or unusual vaginal bleeding (after menopause or between periods)' },
  { id: 'fatigue_weight_loss', label: 'Unexplained tiredness or weight loss' },
];

const breastFormSchema = z.object({
  symptoms: z.array(z.string()),
  image: z.custom<File>().optional(),
});

const ovarianFormSchema = z.object({
    symptoms: z.array(z.string()).refine((value) => value.length > 0, {
        message: 'You have to select at least one symptom.',
    }),
});

type AnalysisResult = {
    riskLevel: "Low" | "Medium" | "High";
    recommendation: string;
    analysis: string;
}

export function BreastCancerScreening() {
  const [isPending, startTransition] = useTransition();
  const [breastResult, setBreastResult] = useState<AnalysisResult | null>(null);
  const [ovarianResult, setOvarianResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const breastForm = useForm<z.infer<typeof breastFormSchema>>({
    resolver: zodResolver(breastFormSchema),
    defaultValues: { symptoms: [], image: undefined },
  });

  const ovarianForm = useForm<z.infer<typeof ovarianFormSchema>>({
    resolver: zodResolver(ovarianFormSchema),
    defaultValues: { symptoms: [] },
  });
  
  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return;

    const savedCycles = localStorage.getItem(`${email}_periodCycles`);
    if (savedCycles) {
        const cycles = JSON.parse(savedCycles).map((c: any) => ({ ...c, end: new Date(c.end) }));
        if (cycles.length > 0) {
            const lastCycle = cycles[cycles.length - 1];
            const reminderDate = addDays(lastCycle.end, 4);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            if (today.getTime() === reminderDate.getTime()) {
                toast({
                    title: "Self-Exam Reminder",
                    description: "It's a good time to do your monthly breast self-examination.",
                    duration: 10000,
                });
            }
        }
    }
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      breastForm.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onBreastSubmit = (values: z.infer<typeof breastFormSchema>) => {
    if (values.symptoms.length === 0 && !values.image) {
        toast({
            variant: 'destructive',
            title: 'No Input Provided',
            description: 'Please select at least one symptom or upload an image.',
        });
        return;
    }

    setBreastResult(null);
    startTransition(async () => {
      try {
        let imageDataUri: string | undefined;
        if (values.image) {
            const reader = new FileReader();
            reader.readAsDataURL(values.image);
            imageDataUri = await new Promise(resolve => {
                reader.onload = () => resolve(reader.result as string);
            });
        }
        
        const res = await breastCancerAnalysisAction({ symptoms: values.symptoms, imageDataUri });
        setBreastResult(res);
        toast({ title: 'Analysis Complete', description: 'AI has analyzed your report.' });
      } catch (error) {
        console.error('Failed to get analysis:', error);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not get analysis. Please try again.' });
      }
    });
  };
  
  const onOvarianSubmit = (values: z.infer<typeof ovarianFormSchema>) => {
      setOvarianResult("Based on your selected symptoms, it is highly recommended to consult a healthcare professional for a proper evaluation. Please book an appointment with a gynecologist to discuss your concerns.");
      toast({ title: 'Recommendation Ready', description: 'Please review the advice below.' });
  }

  const ConsultDoctorButton = () => (
    <Button className="mt-4" onClick={() => router.push('/consultation')}>
        <Stethoscope className="mr-2 h-4 w-4" /> Consult a Doctor Now
    </Button>
  );

  return (
     <Tabs defaultValue="breast" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breast"><Ribbon className="mr-2 h-4 w-4"/>Breast Cancer</TabsTrigger>
            <TabsTrigger value="ovarian"><ClipboardCheck className="mr-2 h-4 w-4"/>Ovarian Cancer</TabsTrigger>
        </TabsList>
        <TabsContent value="breast">
             <div className="grid md:grid-cols-2 gap-8 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            Breast Cancer Screening
                        </CardTitle>
                        <CardDescription>
                        A guide to self-examination and AI-powered symptom analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                         <div className="rounded-lg border bg-card text-card-foreground p-4">
                             <h3 className="text-base font-semibold mt-0">When to check:</h3>
                             <ul className="my-2">
                                 <li>Once a month.</li>
                                 <li>A few days after your period ends (or the same date each month if you don't have periods).</li>
                                 <li>An automated reminder will be sent 4 days after your period ends.</li>
                             </ul>
                         </div>
                        <h3 className="mt-6">How to Perform a Self-Exam</h3>
                        <ol>
                            <li>
                                <strong>Look in a Mirror</strong>: Stand with arms down, then raised, then hands on hips. Look for changes in breast shape, symmetry, or skin alterations like dimpling or puckering.
                            </li>
                            <li>
                                <strong>Feel Each Breast</strong>: Lie down to examine one breast at a time. Use the pads of your three middle fingers to apply light, medium, and firm pressure in a circular or up-and-down pattern, covering the entire breast and armpit area.
                            </li>
                            <li>
                                <strong>Check for Changes</strong>: Feel for any lumps, knots, thickened areas, or tenderness.
                            </li>
                        </ol>
                    </CardContent>
                </Card>
                <div>
                    <Card>
                        <Form {...breastForm}>
                            <form onSubmit={breastForm.handleSubmit(onBreastSubmit)}>
                            <CardHeader>
                                <CardTitle>Symptom & Image Checker</CardTitle>
                                <CardDescription>
                                    Check any symptoms you're experiencing and optionally upload a photo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                control={breastForm.control}
                                name="symptoms"
                                render={() => (
                                    <FormItem>
                                    <FormLabel className="font-semibold">Select Symptoms</FormLabel>
                                    {breastSymptoms.map((symptom) => (
                                        <FormField
                                        key={symptom.id}
                                        control={breastForm.control}
                                        name="symptoms"
                                        render={({ field }) => (
                                            <FormItem key={symptom.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(symptom.label)}
                                                    onCheckedChange={(checked) => (
                                                        checked
                                                        ? field.onChange([...field.value, symptom.label])
                                                        : field.onChange(field.value?.filter((v) => v !== symptom.label))
                                                    )}
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
                                <FormField
                                    control={breastForm.control}
                                    name="image"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Upload Image (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {preview && (
                                <div className="relative group">
                                    <p className="text-sm font-medium mb-2">Image Preview:</p>
                                    <img src={preview} alt="Breast area preview" className="rounded-lg w-full object-cover" />
                                    <Button
                                    variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => { setPreview(null); breastForm.setValue('image', undefined); }}
                                    >
                                    <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                )}


                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                                Analyze
                                </Button>
                            </CardFooter>
                            </form>
                        </Form>
                    </Card>
                     {breastResult && (
                        <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI Analysis Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Alert variant={breastResult.riskLevel === 'High' ? 'destructive' : 'default'} className={cn(breastResult.riskLevel === 'Medium' && 'border-amber-500/50 text-amber-600 [&>svg]:text-amber-600')}>
                                {breastResult.riskLevel !== 'Low' && <AlertTriangle className="h-4 w-4" />}
                                <AlertTitle className={cn("text-lg", breastResult.riskLevel === 'High' ? 'text-destructive' : breastResult.riskLevel === 'Medium' ? 'text-amber-700' : 'text-green-700' )}>
                                    Risk Level: {breastResult.riskLevel}
                                </AlertTitle>
                                <AlertDescription className="font-semibold">
                                    {breastResult.recommendation}
                                </AlertDescription>
                            </Alert>
                             <div>
                                <h4 className="font-semibold">Analysis Details</h4>
                                <p className="text-sm text-muted-foreground">{breastResult.analysis}</p>
                            </div>
                            {breastResult.riskLevel !== 'Low' && <ConsultDoctorButton />}
                        </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </TabsContent>
        <TabsContent value="ovarian">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Ovarian Cancer Symptom Checker</CardTitle>
                    <CardDescription>
                        Ovarian cancer symptoms can be persistent and a change from normal. Check any that apply to you.
                    </CardDescription>
                </CardHeader>
                <Form {...ovarianForm}>
                    <form onSubmit={ovarianForm.handleSubmit(onOvarianSubmit)}>
                        <CardContent>
                             <FormField
                                control={ovarianForm.control}
                                name="symptoms"
                                render={() => (
                                    <FormItem>
                                    <FormLabel className="font-semibold">Select Symptoms</FormLabel>
                                    {ovarianSymptoms.map((symptom) => (
                                        <FormField
                                        key={symptom.id}
                                        control={ovarianForm.control}
                                        name="symptoms"
                                        render={({ field }) => (
                                            <FormItem key={symptom.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(symptom.label)}
                                                    onCheckedChange={(checked) => (
                                                        checked
                                                        ? field.onChange([...field.value, symptom.label])
                                                        : field.onChange(field.value?.filter((v) => v !== symptom.label))
                                                    )}
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
                        <CardFooter className="flex-col items-start gap-4">
                            <Button type="submit">Check Symptoms</Button>
                            {ovarianResult && (
                                <Alert variant="destructive" className="w-full">
                                    <Siren className="h-4 w-4"/>
                                    <AlertTitle>Recommendation</AlertTitle>
                                    <AlertDescription>
                                        {ovarianResult}
                                    </AlertDescription>
                                    <ConsultDoctorButton />
                                </Alert>
                            )}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </TabsContent>
     </Tabs>
  );
}
