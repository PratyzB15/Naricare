'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Baby, Loader2, UploadCloud, FileImage, X, BrainCircuit, HeartPulse, ListChecks } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { babyHealthTrackerAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export type BabyHealthPrediction = {
  babySizeEstimate: string;
  healthAssessment: string;
  recommendations: string;
};

const formSchema = z.object({
  pregnancyWeeks: z.coerce.number().min(1, 'Please enter pregnancy weeks.').max(42, 'Please enter valid pregnancy weeks.'),
  additionalNotes: z.string().optional(),
  ultrasoundImage: z.custom<File>((val) => val instanceof File, 'Please upload an ultrasound image.').refine(
    (file) => file.size < 4 * 1024 * 1024, // 4MB
    'Image size should be less than 4MB.'
  ).refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'Only .jpg and .png formats are supported.'
  ),
});

export function BabyHealthTracker() {
  const [isPending, startTransition] = useTransition();
  const [predictionResult, setPredictionResult] = useState<BabyHealthPrediction | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pregnancyWeeks: undefined,
      additionalNotes: '',
    },
  });

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


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setPredictionResult(null);
    startTransition(async () => {
      try {
        const ultrasoundImageDataUri = await fileToBase64(values.ultrasoundImage);
        
        const result = await babyHealthTrackerAction({
          pregnancyWeeks: values.pregnancyWeeks,
          additionalNotes: values.additionalNotes,
          ultrasoundImageDataUri: ultrasoundImageDataUri
        });
        setPredictionResult(result);
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

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Baby />
            Baby Health Tracker
          </CardTitle>
          <CardDescription>
            Upload an ultrasound image to get AI-powered insights on your baby's health and growth.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ultrasoundImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ultrasound Image</FormLabel>
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
                  <div className="relative group">
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
              </div>

              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="pregnancyWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pregnancy Duration (in weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any specific concerns or notes from your doctor..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={isPending || !preview}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Ultrasound
              </Button>
            </CardFooter>
          </form>
        </Form>
        {predictionResult && (
          <CardContent className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><BrainCircuit /> AI Analysis Result</h3>
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary">
                    <h4 className="font-semibold flex items-center gap-2"><Baby /> Baby Size Estimate</h4>
                    <p className="text-muted-foreground">{predictionResult.babySizeEstimate}</p>
                </div>
                 <div className="p-4 rounded-lg bg-secondary">
                    <h4 className="font-semibold flex items-center gap-2"><HeartPulse /> Health Assessment</h4>
                    <p className="text-muted-foreground">{predictionResult.healthAssessment}</p>
                </div>
                 <div className="p-4 rounded-lg bg-secondary">
                    <h4 className="font-semibold flex items-center gap-2"><ListChecks /> Recommendations</h4>
                    <p className="text-muted-foreground">{predictionResult.recommendations}</p>
                </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
