'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Baby, Loader2, UploadCloud, X, BrainCircuit, HeartPulse, ListChecks, Dna, Activity, CalendarClock, ShieldAlert, Heart } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { babyHealthTrackerAction, getPregnancyProgressAction, getHormonalNutritionAction, babyGrowthAnalysisAction, pregnancySymptomCheckerAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, differenceInMonths, subMonths } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { PregnancyProgressOutput } from '@/ai/flows/pregnancy-progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import type { BabyGrowthAnalysisOutput } from '@/ai/flows/baby-growth-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import type { PregnancySymptomCheckerOutput } from '@/ai/flows/pregnancy-symptom-checker';

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

const symptomCheckerSchema = z.object({
    symptoms: z.array(z.string()).refine((value) => value.length > 0, {
        message: 'Please select at least one symptom.',
    }),
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

const pregnancySymptoms = [
  'Mild nausea & vomiting (Morning sickness)', 'Excessive vomiting (Hyperemesis Gravidarum)', 'Mild back pain',
  'Severe back pain with fever', 'Mild leg swelling', 'Sudden severe swelling (face, hands), headache, vision changes',
  'Mild abdominal discomfort', 'Severe abdominal pain with vaginal bleeding', 'Sudden vaginal bleeding (any amount)',
  'Spotting in early pregnancy', 'Painful urination, burning', 'Itching all over, especially palms & soles',
  'Shortness of breath (mild)', 'Sudden severe breathlessness, chest pain', 'Fever with chills',
  'Severe headache + blurred vision', 'Reduced fetal movement', 'Water leakage (clear fluid)',
];


function formatBabyAge(totalMonths: number): string {
    if (totalMonths < 12) {
        return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
    }
    const years = Math.floor(totalMonths / 12);
    return `${years} year${years > 1 ? 's' : ''} (${totalMonths} months)`;
}

// Reusable component for the pre-delivery view
const PregnancyView = ({ 
  form, 
  handleConfirmWeek, 
  isProgressPending, 
  progressResult,
  onUltrasoundSubmit,
  isAnalysisPending,
  analysisResult,
  preview,
  setPreview,
  symptomForm,
  onSymptomSubmit,
  isSymptomPending,
  symptomResult
}: {
  form: any;
  handleConfirmWeek: () => void;
  isProgressPending: boolean;
  progressResult: PregnancyProgressOutput | null;
  onUltrasoundSubmit: (values: any) => void;
  isAnalysisPending: boolean;
  analysisResult: UltrasoundAnalysis | null;
  preview: string | null;
  setPreview: (p: string | null) => void;
  symptomForm: any;
  onSymptomSubmit: (values: any) => void;
  isSymptomPending: boolean;
  symptomResult: PregnancySymptomCheckerOutput | null;
}) => {
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

  return (
     <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><CalendarClock /> Track Your Progress</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Form {...form}>
                        <form>
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
                        </form>
                    </Form>
                </CardContent>
             </Card>
            
            <div className="p-4 rounded-lg bg-secondary/50 space-y-4 min-h-[200px] mt-4">
                <div>
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><Dna /> Week {form.watch('pregnancyWeeks') || 'X'}: Fetal Development</h4>
                    {isProgressPending && <Loader2 className="h-5 w-5 animate-spin mt-2" />}
                    {progressResult && <p className="text-muted-foreground whitespace-pre-wrap text-sm">{progressResult.fetalDevelopment}</p>}
                    {!isProgressPending && !progressResult && <p className="text-sm text-muted-foreground">Confirm a week to see development details.</p>}
                </div>
                {progressResult?.motherSymptoms && (
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 text-lg"><Heart /> Your Body This Week</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap text-sm">{progressResult.motherSymptoms}</p>
                     </div>
                )}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert /> Symptom Checker</CardTitle>
                    <CardDescription>If you're feeling unwell, select your symptoms below for immediate advice.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...symptomForm}>
                        <form onSubmit={symptomForm.handleSubmit(onSymptomSubmit)} className='space-y-4'>
                            <FormField
                                control={symptomForm.control}
                                name="symptoms"
                                render={() => (
                                    <FormItem>
                                    <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-2">
                                        {pregnancySymptoms.map((symptom) => (
                                            <FormField
                                            key={symptom}
                                            control={symptomForm.control}
                                            name="symptoms"
                                            render={({ field }) => (
                                                <FormItem key={symptom} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(symptom)}
                                                        onCheckedChange={(checked) =>
                                                        checked
                                                            ? field.onChange([...(field.value || []), symptom])
                                                            : field.onChange(field.value?.filter((v) => v !== symptom))
                                                        }
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm">{symptom}</FormLabel>
                                                </FormItem>
                                            )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSymptomPending}>
                                {isSymptomPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Symptoms"}
                            </Button>
                        </form>
                    </Form>
                     {symptomResult && (
                         <Alert className="mt-4" variant={symptomResult.severity.includes('High') ? 'destructive' : 'default'}>
                            <AlertTitle>{symptomResult.analysis}</AlertTitle>
                            <AlertDescription>
                                <p><strong>Severity:</strong> {symptomResult.severity}</p>
                                <p><strong>Immediate Action:</strong> {symptomResult.immediateAction}</p>
                                <p><strong>Prevention:</strong> {symptomResult.preventionTips}</p>
                                <p className="mt-2 text-xs"><strong>Medication Note:</strong> {symptomResult.safeMedications}</p>
                            </AlertDescription>
                         </Alert>
                    )}
                </CardContent>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onUltrasoundSubmit)}>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UploadCloud /> Ultrasound Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="ultrasoundImage"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Ultrasound Image (Optional)</FormLabel>
                                    <FormControl>
                                    <div className="relative border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors">
                                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                        Drag & drop or click to upload
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
                                    <FormLabel>Additional Notes for Analysis (optional)</FormLabel>
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
                        </CardContent>
                     </Card>
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
    </div>
  );
}

// Reusable component for the post-delivery view
const PostDeliveryView = ({
    babyBirthDate,
    babyAgeInMonths,
    handleInitialAgeSubmit,
    initialBabyAgeForm,
    postBirthForm,
    onPostBirthSubmit,
    deliveryType,
    setDeliveryType,
    handleDeliveryTypeSubmit,
    postDeliveryAdvice,
    babyPhotoPreview,
    setBabyPhotoPreview,
    isAnalysisPending,
    babyGrowthAnalysisResult,
    renderFormattedText,
}: any) => {

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
    
    return (
        !babyBirthDate ? (
            <Card className="mt-4">
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
            <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-8">
                    <Card className="bg-pink-50/50">
                        <CardHeader>
                            <CardTitle>Your Recovery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                </div>
                
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
            </div>
        )
    );
}


export function PregnancyBabyTracker() {
  const router = useRouter();
  const [isAnalysisPending, startAnalysisTransition] = useTransition();
  const [isProgressPending, startProgressTransition] = useTransition();
  const [isSymptomPending, startSymptomTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<UltrasoundAnalysis | null>(null);
  const [symptomResult, setSymptomResult] = useState<PregnancySymptomCheckerOutput | null>(null);
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

  const symptomForm = useForm<z.infer<typeof symptomCheckerSchema>>({
    resolver: zodResolver(symptomCheckerSchema),
    defaultValues: { symptoms: [] },
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
    if (weeks >= 1 && weeks <= 57) {
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
  }, [toast]);


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

        if (weeks > 0 && weeks < 57) {
            form.setValue('pregnancyWeeks', weeks, { shouldValidate: true });
            fetchPregnancyProgress(weeks);
        }
        
        if (weeks >= 49) {
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

  const onSymptomSubmit = (values: z.infer<typeof symptomCheckerSchema>) => {
    setSymptomResult(null);
    startSymptomTransition(async () => {
        try {
            const result = await pregnancySymptomCheckerAction({ symptoms: values.symptoms });
            setSymptomResult(result);
            toast({ title: 'Symptom Analysis Complete' });
        } catch (error) {
            console.error('Symptom check failed:', error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze symptoms. Please try again.',
            });
        }
    })
  }

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
        if (weeks < 57) {
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
      startAnalysisTransition(async () => {
          try {
            const nutrition = await getHormonalNutritionAction({ postDelivery: true });
            setPostDeliveryAdvice(nutrition.recommendations);
          } catch(e) {
             console.error("Failed to get post-delivery nutrition", e);
             toast({ variant: 'destructive', title: 'Advice Error', description: 'Could not fetch post-delivery advice.' });
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
        
        <CardContent>
            {pregnancyWeeks === null || pregnancyWeeks < 49 ? (
                 <PregnancyView 
                    form={form}
                    handleConfirmWeek={handleConfirmWeek}
                    isProgressPending={isProgressPending}
                    progressResult={progressResult}
                    onUltrasoundSubmit={onUltrasoundSubmit}
                    isAnalysisPending={isAnalysisPending}
                    analysisResult={analysisResult}
                    preview={preview}
                    setPreview={setPreview}
                    symptomForm={symptomForm}
                    onSymptomSubmit={onSymptomSubmit}
                    isSymptomPending={isSymptomPending}
                    symptomResult={symptomResult}
                />
            ) : (
                <Tabs defaultValue="baby" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="baby">Baby Growth</TabsTrigger>
                        <TabsTrigger value="pregnancy">My Pregnancy Journey</TabsTrigger>
                    </TabsList>
                    <TabsContent value="baby">
                         <PostDeliveryView
                            babyBirthDate={babyBirthDate}
                            babyAgeInMonths={babyAgeInMonths}
                            handleInitialAgeSubmit={handleInitialAgeSubmit}
                            initialBabyAgeForm={initialBabyAgeForm}
                            postBirthForm={postBirthForm}
                            onPostBirthSubmit={onPostBirthSubmit}
                            deliveryType={deliveryType}
                            setDeliveryType={setDeliveryType}
                            handleDeliveryTypeSubmit={handleDeliveryTypeSubmit}
                            postDeliveryAdvice={postDeliveryAdvice}
                            babyPhotoPreview={babyPhotoPreview}
                            setBabyPhotoPreview={setBabyPhotoPreview}
                            isAnalysisPending={isAnalysisPending}
                            babyGrowthAnalysisResult={babyGrowthAnalysisResult}
                            renderFormattedText={renderFormattedText}
                         />
                    </TabsContent>
                    <TabsContent value="pregnancy">
                        <PregnancyView 
                            form={form}
                            handleConfirmWeek={handleConfirmWeek}
                            isProgressPending={isProgressPending}
                            progressResult={progressResult}
                            onUltrasoundSubmit={onUltrasoundSubmit}
                            isAnalysisPending={isAnalysisPending}
                            analysisResult={analysisResult}
                            preview={preview}
                            setPreview={setPreview}
                            symptomForm={symptomForm}
                            onSymptomSubmit={onSymptomSubmit}
                            isSymptomPending={isSymptomPending}
                            symptomResult={symptomResult}
                        />
                    </TabsContent>
                </Tabs>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
