'use client';

import { useState, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Baby, Loader2, Upload, Sparkles, Wand2 } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { babyHealthTrackerAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { BabyHealthTrackerOutput } from '@/ai/flows/baby-health-tracker';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  ultrasoundImage: z.custom<File>(val => val instanceof File, 'Please upload an ultrasound image.'),
  pregnancyWeeks: z.coerce.number().min(1, 'Please enter pregnancy weeks.').max(42),
  additionalNotes: z.string().optional(),
});

export function BabyHealthTracker() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BabyHealthTrackerOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pregnancyWeeks: 20,
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
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      try {
        const ultrasoundImageDataUri = await fileToDataUri(values.ultrasoundImage);
        const res = await babyHealthTrackerAction({ ...values, ultrasoundImageDataUri });
        setResult(res);
      } catch (error) {
        console.error('Baby health tracker failed:', error);
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: 'Could not analyze the ultrasound. Please try again later.',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby />
            AI-Powered Baby Health Tracker
          </CardTitle>
          <CardDescription>
            Upload an ultrasound image and provide some details to get an AI-powered analysis of your baby's health and development.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                  control={form.control}
                  name="ultrasoundImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ultrasound Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center w-full">
                           <div
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                            onClick={() => fileInputRef.current?.click()}
                           >
                            {preview ? (
                               <Image src={preview} alt="Ultrasound preview" width={256} height={256} className="object-contain h-full w-full rounded-lg" />
                            ) : (
                               <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                               </div>
                            )}
                          </div>
                          <Input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="pregnancyWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pregnancy (in weeks)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 20" {...field} /></FormControl>
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
                      <Textarea placeholder="Any specific concerns or observations..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Analyze Ultrasound
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {isPending && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
             <p className="ml-4 text-muted-foreground">Analyzing image with AI...</p>
          </div>
        )}

      {result && (
        <Card className="shadow-lg border-accent/30 animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent"/>
              AI Health Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Baby Size Estimate</h3>
              <p className="text-sm text-foreground/80">{result.babySizeEstimate}</p>
            </div>
             <div>
              <h3 className="font-semibold mb-1">Health Assessment</h3>
              <p className="text-sm text-foreground/80">{result.healthAssessment}</p>
            </div>
             <div>
              <h3 className="font-semibold mb-1">Personalized Recommendations</h3>
              <p className="text-sm text-foreground/80">{result.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
