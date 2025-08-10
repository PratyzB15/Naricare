'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Baby, Loader2, UploadCloud, X, BrainCircuit, HeartPulse, ListChecks, Dna } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { babyHealthTrackerAction, getPregnancyProgressAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PregnancyProgressOutput } from '@/ai/flows/pregnancy-progress';

export type UltrasoundAnalysis = {
  babySizeEstimate: string;
  healthAssessment: string;
  recommendations: string;
};


const formSchema = z.object({
  pregnancyWeeks: z.coerce.number().min(1, 'Please enter pregnancy weeks.').max(42, 'Please enter valid pregnancy weeks.'),
  additionalNotes: z.string().optional(),
  ultrasoundImage: z.custom<File>((val) => val instanceof File, 'Please upload an ultrasound image.').optional().refine(
    (file) => !file || file.size < 4 * 1024 * 1024, // 4MB
    'Image size should be less than 4MB.'
  ).refine(
    (file) => !file || ['image/jpeg', 'image/png'].includes(file.type),
    'Only .jpg and .png formats are supported.'
  ),
});

export function PregnancyBabyTracker() {
  const router = useRouter();
  const [isAnalysisPending, startAnalysisTransition] = useTransition();
  const [isProgressPending, startProgressTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<UltrasoundAnalysis | null>(null);
  const [progressResult, setProgressResult] = useState<PregnancyProgressOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pregnancyWeeks: undefined,
      additionalNotes: '',
      ultrasoundImage: undefined,
    },
  });
  
  const [isClient, setIsClient] = useState(false);

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
        form.setValue('pregnancyWeeks', weeks > 0 ? weeks : 1, { shouldValidate: true });
    }
  }, [form, router]);


  const fetchPregnancyProgress = useCallback((weeks: number, email: string) => {
    if (weeks >= 1 && weeks <= 42) {
        setProgressResult(null);
        startProgressTransition(async () => {
             try {
                const result = await getPregnancyProgressAction({ pregnancyWeeks: weeks });
                setProgressResult(result);
                
                const today = new Date();
                const startDate = new Date(today.setDate(today.getDate() - (weeks * 7)));
                localStorage.setItem(`${email}_pregnancyStartDate`, startDate.toISOString());
                 toast({
                    title: `Week ${weeks} Info Loaded`,
                    description: 'Fetal development details are now showing.',
                });

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

  const handleConfirmWeek = () => {
    const weeks = form.getValues('pregnancyWeeks');
    if (weeks && currentUserEmail) {
        fetchPregnancyProgress(weeks, currentUserEmail);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Week',
            description: 'Please enter a valid pregnancy week.',
        });
    }
  }

  if (!isClient) return null;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Baby />
            Pregnancy & Baby Health Tracker
          </CardTitle>
          <CardDescription>
            Get AI-powered insights on your baby's health, growth, and development.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid md:grid-cols-2 gap-8">
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
                
                <div className="p-4 rounded-lg bg-secondary/50 space-y-2 min-h-[200px] mt-4">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><Dna /> Week {form.watch('pregnancyWeeks') || 'X'}: Fetal Development</h4>
                    {isProgressPending && <Loader2 className="h-5 w-5 animate-spin" />}
                    {progressResult && <p className="text-muted-foreground whitespace-pre-wrap text-sm">{progressResult.fetalDevelopment}</p>}
                    {!isProgressPending && !progressResult && <p className="text-sm text-muted-foreground">Confirm a week to see development details.</p>}
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
                {isAnalysisPending ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
