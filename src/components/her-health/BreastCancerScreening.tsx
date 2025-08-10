'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, BrainCircuit, HeartPulse, Loader2, Ribbon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { breastCancerAnalysisAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { cn } from '@/lib/utils';

const symptoms = [
  { id: 'lump', label: 'Lump or thickened area in the breast or underarm' },
  { id: 'lump_growth', label: 'If the lump is growing day by day' },
  { id: 'size_shape_change', label: 'Change in breast size or shape' },
  { id: 'skin_dimpling', label: 'Skin dimpling, puckering, or “orange peel” texture' },
  { id: 'nipple_inversion', label: 'Nipple inversion (if new)' },
  { id: 'skin_redness', label: 'Redness, rash, or swelling of skin' },
  { id: 'nipple_discharge', label: 'Unusual nipple discharge (bloody or clear, not milky)' },
  { id: 'persistent_pain', label: 'Persistent pain in one area' },
];

const formSchema = z.object({
  symptoms: z.array(z.string()).refine((value) => value.some((item) => item), {
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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await breastCancerAnalysisAction(values);
        setResult(res);
        toast({
            title: 'Analysis Complete',
            description: 'AI has analyzed your reported symptoms.',
        });
      } catch (error) {
        console.error('Failed to get analysis:', error);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not get analysis at this time. Please try again.',
        });
      }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Ribbon />
                    Breast Cancer Screening
                </CardTitle>
                <CardDescription>
                A guide to self-examination and AI-powered symptom analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Disclaimer</AlertTitle>
                        <AlertDescription>
                        This tool does not provide a medical diagnosis. It is for informational purposes only. Always consult a healthcare professional for any health concerns.
                        </AlertDescription>
                    </Alert>

                    <h3 className="mt-6">Self Breast Examination Steps</h3>
                    <p>Follow these steps monthly to check for any irregularities.</p>
                    <ol>
                        <li>
                            <strong>Look in a Mirror</strong>: Stand with your arms down, then raised, and finally with hands on your hips. Look for changes in breast shape, symmetry, or any skin changes like dimpling or puckering.
                        </li>
                        <li>
                            <strong>Feel Each Breast</strong>: Lie down to examine one breast, then the other. Use the pads of your three middle fingers to apply light, medium, and firm pressure in a circular or up-and-down pattern, covering the entire breast and armpit area.
                        </li>
                        <li>
                            <strong>Check for Changes</strong>: Feel for any lumps, knots, thickened areas, or tenderness. Note anything that feels different from the surrounding tissue.
                        </li>
                    </ol>
                </div>
            </CardContent>
        </Card>
        <div>
            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Symptom Checker</CardTitle>
                        <CardDescription>
                            Check any symptoms you are currently experiencing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                        control={form.control}
                        name="symptoms"
                        render={() => (
                            <FormItem>
                            {symptoms.map((symptom) => (
                                <FormField
                                key={symptom.id}
                                control={form.control}
                                name="symptoms"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={symptom.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(symptom.label)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, symptom.label])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== symptom.label
                                                    )
                                                );
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">{symptom.label}</FormLabel>
                                    </FormItem>
                                    );
                                }}
                                />
                            ))}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze My Symptoms
                        </Button>
                    </CardFooter>
                    </form>
                </Form>
            </Card>

             {result && (
                <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI Analysis Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Alert variant={result.riskLevel === 'High' ? 'destructive' : 'default'} className={cn(result.riskLevel === 'Medium' && 'border-amber-500/50 text-amber-600 [&>svg]:text-amber-600')}>
                        {result.riskLevel === 'High' && <AlertTriangle className="h-4 w-4" />}
                        <AlertTitle className={cn("text-lg", result.riskLevel === 'High' ? 'text-destructive' : result.riskLevel === 'Medium' ? 'text-amber-700' : 'text-green-700' )}>
                            Risk Level: {result.riskLevel}
                        </AlertTitle>
                        <AlertDescription className="font-semibold">
                            {result.recommendation}
                        </AlertDescription>
                    </Alert>
                     <div>
                        <h4 className="font-semibold">Analysis Details</h4>
                        <p className="text-sm text-muted-foreground">{result.analysis}</p>
                    </div>
                </CardContent>
                </Card>
            )}

        </div>
    </div>
  );
}
