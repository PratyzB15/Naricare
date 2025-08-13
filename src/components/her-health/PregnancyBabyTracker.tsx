'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Baby, Loader2, UploadCloud, X, BrainCircuit, HeartPulse, ListChecks, Dna, Activity, CalendarClock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { babyHealthTrackerAction, getPregnancyProgressAction, getHormonalNutritionAction, babyGrowthAnalysisAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, differenceInMonths, subMonths } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { PregnancyProgressOutput } from '@/ai/flows/pregnancy-progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle } from '../ui/alert';
import { Label } from '../ui/label';
import type { BabyGrowthAnalysisOutput } from '@/ai/flows/baby-growth-analysis';

export type UltrasoundAnalysis = {
  babySizeEstimate: string;
  healthAssessment: string;
  recommendations: string;
};

const formSchema = z.object({
  pregnancyWeeks: z.coerce.number().min(1, 'Please enter pregnancy weeks.').max(57, 'Please enter valid weeks.'),
  additionalNotes: z.string().optional(),
  ultrasoundImage: z.custom<File>((val) => val instanceof File, 'Please upload an ultrasound image.').optional().refine(
    (file) => !file || file.size < 4 * 1024 * 1024, // 4MB
    'Image size should be less than 4MB.'
  ).refine(
    (file) => !file || ['image/jpeg', 'image/png'].includes(file.type),
    'Only .jpg and .png formats are supported.'
  ),
});

const initialBabyAgeSchema = z.object({
    ageInMonths: z.coerce.number().min(0, "Age must be positive.").max(36, "This tracker supports up to 36 months."),
});

const postBirthFormSchema = z.object({
    weight: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    headCircumference: z.coerce.number().optional(),
    babyImage: z.custom<File>().optional(),
});

type DeliveryType = "normal" | "c-section";

function formatBabyAge(totalMonths: number): string {
    if (totalMonths < 12) {
        return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
    }
    const years = Math.floor(totalMonths / 12);
    return `${years} year${years > 1 ? 's' : ''} (${totalMonths} months)`;
}


export function PregnancyBabyTracker() {
  const router = useRouter();
  const [isAnalysisPending, startAnalysisTransition] = useTransition();
  const [isProgressPending, startProgressTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<UltrasoundAnalysis | null>(null);
  const [babyGrowthAnalysisResult, setBabyGrowthAnalysisResult] = useState<BabyGrowthAnalysisOutput | null>(null);
  const [progressResult, setProgressResult] = useState<PregnancyProgressOutput | null>(null);
  const [postDeliveryAdvice, setPostDeliveryAdvice] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [babyPhotoPreview, setBabyPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [babyBirthDate, setBabyBirthDate] = useState<Date | null>(null);
  const [babyAgeInMonths, setBabyAgeInMonths] = useState<number | null>(null);
  
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pregnancyWeeks: undefined,
      additionalNotes: '',
      ultrasoundImage: undefined,
    },
  });
  
  const initialBabyAgeForm = useForm<z.infer<typeof initialBabyAgeSchema>>({
      resolver: zodResolver(initialBabyAgeSchema),
      defaultValues: { ageInMonths: undefined },
  });

  const postBirthForm = useForm<z.infer<typeof postBirthFormSchema>>({
      resolver: zodResolver(postBirthFormSchema),
      defaultValues: {
        weight: undefined,
        height: undefined,
        headCircumference: undefined,
        babyImage: undefined,
      },
  });
  
  const fetchPregnancyProgress = useCallback((weeks: number) => {
    if (weeks >= 1 && weeks <= 42) {
        setProgressResult(null);
        startProgressTransition(async () => {
             try {
                const result = await getPregnancyProgressAction({ pregnancyWeeks: weeks });
                setProgressResult(result);
             } catch (error) {
                 console.error("Failed to get pregnancy progress", error);
                 toast({
                    variant: 'destructive',
                    title: 'Development Info Error',
                    description: 'Could not fetch fetal development details at this time.',
                });
             }
        })
    }
  }, [toast, startProgressTransition]);


  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    setCurrentUserEmail(email);

    const savedPregnancy = localStorage.getItem(`${email}_pregnancyStartDate`);
    if (savedPregnancy) {
        const startDate = new Date(savedPregnancy);
        const weeks = Math.floor(differenceInDays(new Date(), startDate) / 7);
        setPregnancyWeeks(weeks);

        if (weeks > 0 && weeks < 49) {
            form.setValue('pregnancyWeeks', weeks, { shouldValidate: true });
            fetchPregnancyProgress(weeks);
        } else if (weeks >= 49) {
            form.setValue('pregnancyWeeks', weeks, { shouldValidate: true });
            const savedBirthDate = localStorage.getItem(`${email}_babyBirthDate`);
            if (savedBirthDate) {
                const birthDate = new Date(savedBirthDate);
                setBabyBirthDate(birthDate);
                setBabyAgeInMonths(differenceInMonths(new Date(), birthDate));

                const lastLog = localStorage.getItem(`${email}_lastGrowthLog`);
                if (lastLog) {
                    if (differenceInDays(new Date(), new Date(lastLog)) > 30) {
                         toast({
                            title: "Monthly Check-in Reminder",
                            description: "It's time to log your baby's growth for this month!",
                            duration: 10000,
                        });
                    }
                } else {
                     toast({
                        title: "Welcome to Baby Growth Tracking!",
                        description: "Don't forget to log your baby's growth for the first time.",
                        duration: 10000,
                    });
                }
            }
        }
    }
  }, [form, router, fetchPregnancyProgress, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('ultrasoundImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBabyPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      postBirthForm.setValue('babyImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBabyPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const onUltrasoundSubmit = (values: z.infer<typeof formSchema>) => {
    if (!values.ultrasoundImage) {
        toast({
            variant: 'destructive',
            title: 'Ultrasound Image Required',
            description: 'Please upload an ultrasound image to get an analysis.',
        });
        return;
    }

    setAnalysisResult(null);
    startAnalysisTransition(async () => {
      try {
        const ultrasoundImageDataUri = await fileToBase64(values.ultrasoundImage!);
        
        const result = await babyHealthTrackerAction({
          pregnancyWeeks: values.pregnancyWeeks,
          additionalNotes: values.additionalNotes,
          ultrasoundImageDataUri: ultrasoundImageDataUri
        });
        setAnalysisResult(result);
        toast({
            title: 'Analysis Complete',
            description: 'AI has analyzed the ultrasound image.',
        });
      } catch (error) {
        console.error('Analysis failed:', error);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not get analysis at this time. Please try again later.',
        });
      }
    });
  };

  const onPostBirthSubmit = (values: z.infer<typeof postBirthFormSchema>) => {
    if (babyAgeInMonths === null) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not determine baby\'s age.' });
        return;
    }
    setBabyGrowthAnalysisResult(null);
    startAnalysisTransition(async () => {
        try {
            let babyImageDataUri: string | undefined;
            if (values.babyImage) {
                babyImageDataUri = await fileToBase64(values.babyImage);
            }
            const result = await babyGrowthAnalysisAction({
                ageInMonths: babyAgeInMonths,
                weightInKg: values.weight,
                heightInCm: values.height,
                headCircumferenceInCm: values.headCircumference,
                babyPhotoDataUri: babyImageDataUri,
            });
            setBabyGrowthAnalysisResult(result);
            if (currentUserEmail) {
                localStorage.setItem(`${currentUserEmail}_lastGrowthLog`, new Date().toISOString());
            }
            toast({ title: 'Growth Analysis Complete' });
        } catch(e) {
            console.error('Growth analysis failed:', e);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not perform growth analysis.' });
        }
    });
  }


  const handleConfirmWeek = () => {
    const weeks = form.getValues('pregnancyWeeks');
    if (weeks && currentUserEmail) {
        setPregnancyWeeks(weeks);
        if (weeks < 49) {
            const today = new Date();
            const startDate = new Date(today.setDate(today.getDate() - (weeks * 7)));
            localStorage.setItem(`${currentUserEmail}_pregnancyStartDate`, startDate.toISOString());
            fetchPregnancyProgress(weeks);
            toast({
                title: `Pregnancy Tracking Started!`,
                description: `Now tracking from week ${weeks}.`,
            });
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Week',
            description: 'Please enter a valid pregnancy week.',
        });
    }
  }

  const handleInitialAgeSubmit = (values: z.infer<typeof initialBabyAgeSchema>) => {
      const { ageInMonths } = values;
      const birthDate = subMonths(new Date(), ageInMonths);
      setBabyBirthDate(birthDate);
      setBabyAgeInMonths(ageInMonths);
      if (currentUserEmail) {
          localStorage.setItem(`${currentUserEmail}_babyBirthDate`, birthDate.toISOString());
      }
      toast({
          title: 'Baby\'s Age Logged!',
          description: 'The app will now track your baby\'s age automatically.',
      });
  }

  const handleDeliveryTypeSubmit = () => {
      let advice = "";
      if (deliveryType === 'normal') {
          advice = `**Recovery Focus**: Rest and hydration are key. Start with gentle walks and pelvic floor exercises (Kegels) as you feel comfortable. 
- **Activity**: Avoid heavy lifting for at least 6 weeks. 
- **Diet**: A balanced diet rich in iron and protein will aid recovery.`;
      } else if (deliveryType === 'c-section') {
          advice = `**Recovery Focus**: Your body needs more time to heal. Keep your incision clean and dry. Watch for signs of infection like redness or pus.
- **Activity**: Avoid lifting anything heavier than your baby for 6-8 weeks. Walking is a great way to start moving, but avoid strenuous core exercises until your doctor gives you the okay.
- **Diet**: Focus on anti-inflammatory foods and protein.`;
      }
      setPostDeliveryAdvice(advice);

      startAnalysisTransition(async () => {
          try {
            const nutrition = await getHormonalNutritionAction({ postDelivery: true });
            setPostDeliveryAdvice(prev => `${prev}\n\n${nutrition.recommendations}`);
          } catch(e) {
             console.error("Failed to get post-delivery nutrition", e);
          }
      });
  }

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part.trim() !== '');
    return (
        <div className="space-y-4 text-sm">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <h4 key={index} className="font-bold text-md text-foreground">{part.replace(/\*\*/g, '')}</h4>;
                }
                const listItems = part.split(/-\s/g).filter(item => item.trim() !== '');
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

  const renderPostDelivery = () => (
    <div className="md:col-span-2 grid gap-8">
        {!babyBirthDate ? (
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to Motherhood!</CardTitle>
                    <CardDescription>To get started, please log your baby's current age once.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...initialBabyAgeForm}>
                        <form onSubmit={initialBabyAgeForm.handleSubmit(handleInitialAgeSubmit)} className="flex items-end gap-4">
                             <FormField
                                control={initialBabyAgeForm.control}
                                name="ageInMonths"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormLabel>Baby's Current Age (in months)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Log Age</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        ) : (
            <>
                <Card className="bg-pink-50/50">
                    <CardHeader>
                        <CardTitle>Post-Delivery & Baby Growth</CardTitle>
                        <CardDescription>Congratulations! Track your recovery and your baby's development.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Your Recovery</h3>
                            <Label className="font-semibold">How was your delivery?</Label>
                            <RadioGroup onValueChange={(v: DeliveryType) => setDeliveryType(v)} className="grid grid-cols-2 gap-4 mt-2">
                                <Label
                                htmlFor="normal"
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                    deliveryType === 'normal' && "border-pink-500"
                                )}
                                >
                                <RadioGroupItem value="normal" id="normal" className="sr-only" />
                                <span>Normal Delivery</span>
                                </Label>
                                <Label
                                htmlFor="c-section"
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                    deliveryType === 'c-section' && "border-pink-500"
                                )}
                                >
                                <RadioGroupItem value="c-section" id="c-section" className="sr-only"/>
                                <span>C-Section</span>
                                </Label>
                            </RadioGroup>
                            <Button onClick={handleDeliveryTypeSubmit} disabled={!deliveryType}>Get Recovery Advice</Button>
                            {postDeliveryAdvice && (
                                <Alert className="whitespace-pre-wrap">
                                    <AlertTitle className="mb-2 font-bold">Personalized Recovery Plan</AlertTitle>
                                    {renderFormattedText(postDeliveryAdvice)}
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="font-semibold text-lg">Baby's Monthly Check-in</h3>
                        <CardDescription>
                            Log your baby's growth monthly to track their development.
                             <span className="block font-medium text-primary mt-1">Current Age: {babyAgeInMonths !== null ? formatBabyAge(babyAgeInMonths) : 'N/A'}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...postBirthForm}>
                            <form onSubmit={postBirthForm.handleSubmit(onPostBirthSubmit)} className="grid sm:grid-cols-2 gap-4">
                                    <FormField control={postBirthForm.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 3.5" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                                    <FormField control={postBirthForm.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 50" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                                    <FormField control={postBirthForm.control} name="headCircumference" render={({ field }) => (<FormItem><FormLabel>Head Circumference (cm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 34" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                                <FormField
                                    control={postBirthForm.control}
                                    name="babyImage"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Upload Baby's Photo (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/png, image/jpeg" onChange={handleBabyPhotoChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {babyPhotoPreview && (
                                    <div className="relative group sm:col-span-2">
                                    <p className="text-sm font-medium mb-2">Baby Photo Preview:</p>
                                    <img src={babyPhotoPreview} alt="Baby preview" className="rounded-lg w-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => {
                                            setBabyPhotoPreview(null);
                                            postBirthForm.resetField('babyImage');
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    </div>
                                )}

                                <Button type="submit" className="sm:col-span-2" disabled={isAnalysisPending}>
                                    {isAnalysisPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Log Growth & Analyze
                                </Button>
                            </form>
                            </Form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <AlertTitle>AI Baby Growth Analysis</AlertTitle>
                        <CardDescription>
                            Analysis of your baby's growth and development will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAnalysisPending && babyGrowthAnalysisResult === null ? (
                            <div className="flex items-center justify-center h-full rounded-lg bg-secondary">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                            ) : babyGrowthAnalysisResult ? (
                                renderFormattedText(babyGrowthAnalysisResult.analysis)
                            ) : (
                            <div className="flex items-center justify-center h-full rounded-lg bg-secondary text-center p-8">
                                <p className="text-muted-foreground">Submit your baby's details to get an AI-powered growth report.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </>
        )}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Baby />
            Pregnancy & Baby Tracker
          </CardTitle>
          <CardDescription>
            Get AI-powered insights on your baby's health, growth, and development.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid md:grid-cols-2 gap-8">
            {pregnancyWeeks && pregnancyWeeks >= 49 ? renderPostDelivery() :
            (
                <>
                <div className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUltrasoundSubmit)}>
                    <FormField
                    control={form.control}
                    name="pregnancyWeeks"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pregnancy Duration (in weeks)</FormLabel>
                        <FormControl>
                            <div className="flex gap-2">
                                <Input type="number" placeholder="e.g., 20" {...field} value={field.value || ''} />
                                <Button type="button" onClick={handleConfirmWeek} disabled={isProgressPending}>
                                    {isProgressPending ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm"}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="p-4 rounded-lg bg-secondary/50 space-y-4 min-h-[200px] mt-4">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><Dna /> Week {form.watch('pregnancyWeeks') || 'X'}: Fetal Development</h4>
                            {isProgressPending && <Loader2 className="h-5 w-5 animate-spin mt-2" />}
                            {progressResult && <p className="text-muted-foreground whitespace-pre-wrap text-sm">{progressResult.fetalDevelopment}</p>}
                            {!isProgressPending && !progressResult && <p className="text-sm text-muted-foreground">Confirm a week to see development details.</p>}
                        </div>
                        {progressResult?.motherSymptoms && (
                             <div>
                                <h4 className="font-semibold flex items-center gap-2 text-lg"><HeartPulse /> Your Body This Week</h4>
                                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{progressResult.motherSymptoms}</p>
                             </div>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name="ultrasoundImage"
                        render={() => (
                        <FormItem className="mt-4">
                            <FormLabel>Ultrasound Image (Optional)</FormLabel>
                            <FormControl>
                            <div className="relative border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                Drag & drop or click to upload for AI analysis
                                </p>
                                <Input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileChange} 
                                />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {preview && (
                        <div className="relative group mt-4">
                        <p className="text-sm font-medium mb-2">Image Preview:</p>
                        <img src={preview} alt="Ultrasound preview" className="rounded-lg w-full object-cover" />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                            setPreview(null);
                            form.resetField('ultrasoundImage');
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        </div>
                    )}
                    <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                        <FormLabel>Additional Notes for Ultrasound Analysis (optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Any specific concerns or notes from your doctor..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isAnalysisPending || !preview} className="w-full mt-4">
                        {isAnalysisPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze Ultrasound
                    </Button>
                </form>
                </Form>
                </div>

                <div className="space-y-4 pt-8 md:pt-0">
                    {isAnalysisPending && analysisResult === null ? (
                    <div className="flex items-center justify-center h-full rounded-lg bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                    ) : analysisResult ? (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2"><BrainCircuit /> Ultrasound Analysis</h3>
                        <div className="p-4 rounded-lg bg-secondary">
                            <h4 className="font-semibold flex items-center gap-2"><Baby /> Baby Size Estimate</h4>
                            <p className="text-muted-foreground">{analysisResult.babySizeEstimate}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                            <h4 className="font-semibold flex items-center gap-2"><HeartPulse /> Health Assessment</h4>
                            <p className="text-muted-foreground">{analysisResult.healthAssessment}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                            <h4 className="font-semibold flex items-center gap-2"><ListChecks /> Recommendations</h4>
                            <p className="text-muted-foreground">{analysisResult.recommendations}</p>
                        </div>
                    </div>
                    ) : (
                        <div className="flex items-center justify-center h-full rounded-lg bg-secondary text-center p-8">
                            <p className="text-muted-foreground">Upload an ultrasound image and click "Analyze Ultrasound" to see the AI-powered report here.</p>
                        </div>
                    )}
                </div>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
