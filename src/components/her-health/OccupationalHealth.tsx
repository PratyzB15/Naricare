'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, HardHat, HeartPulse, Loader2, ShieldAlert, Briefcase, UserCheck, PersonStanding } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { detectOccupationalDiseaseAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const deskSymptoms = [
  { id: 'neck_pain', label: 'Neck, shoulder, upper-back pain' },
  { id: 'wrist_tingling', label: 'Wrist/hand tingling or numbness' },
  { id: 'eye_strain', label: 'Eye strain, headaches' },
  { id: 'leg_swelling', label: 'Leg swelling, fatigue, varicose veins' },
  { id: 'fatigue_stress', label: 'Fatigue, mental fog, stress' },
  { id: 'urinary_urgency', label: 'Urinary urgency / incontinence' },
  { id: 'musculoskeletal_pain', label: 'Musculoskeletal pain (back, knees)' },
  { id: 'cold_stiffness', label: 'Cold-induced stiffness, discomfort' },
  { id: 'sedentary_risks', label: 'Overall sedentary-related health risks' },
];

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
];

const sexWorkerSymptoms = [
    { id: 'pain_intercourse', label: 'Pain during intercourse' },
    { id: 'unusual_discharge', label: 'Unusual vaginal discharge (yellow/green, foul smell)' },
    { id: 'burning_urination', label: 'Burning sensation while urinating' },
    { id: 'genital_ulcers', label: 'Genital ulcers or sores' },
    { id: 'genital_itching', label: 'Itching around genitals' },
    { id: 'lower_abdominal_pain', label: 'Lower abdominal pain' },
    { id: 'excessive_bleeding', label: 'Excessive bleeding (non-menstrual)' },
    { id: 'skin_rashes', label: 'Skin rashes or lesions on body' },
    { id: 'weight_loss_fever', label: 'Weight loss, fever, night sweats' },
    { id: 'mental_strain', label: 'Severe stress, anxiety, depression' },
    { id: 'substance_dependency', label: 'Drug/alcohol dependency' },
];

const symptomsBySector = {
    desk: deskSymptoms,
    labor: laborSymptoms,
    sex_worker: sexWorkerSymptoms,
};

type Sector = 'desk' | 'labor' | 'sex_worker';

const formSchema = z.object({
  symptoms: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'Please select at least one symptom.',
  }),
});

type AnalysisResult = {
  disease: string;
  cause: string;
  prevention: string;
  medication: string;
};

const SymptomChecker = ({ sector, symptoms, onSubmit, isPending }: { sector: Sector; symptoms: {id: string, label: string}[]; onSubmit: (values: any) => void; isPending: boolean; }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { symptoms: [] },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Symptom Checker</CardTitle>
                <CardDescription>Select any symptoms you're experiencing for an AI analysis based on your work sector.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="max-h-[500px] overflow-y-auto">
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
    );
}


export function OccupationalHealth() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const { toast } = useToast();

  const handleAnalysis = (values: z.infer<typeof formSchema>) => {
    if (!sector) return;
    setResult(null);
    startTransition(async () => {
      try {
        const res = await detectOccupationalDiseaseAction({ sector, symptoms: values.symptoms });
        setResult(res);
        toast({ title: 'Analysis Complete', description: 'AI has analyzed your report.' });
      } catch (error) {
        console.error('Failed to get analysis:', error);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not get analysis. Please try again.' });
      }
    });
  };

  if (!sector) {
      return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle>Occupational Health Checker</CardTitle>
                <CardDescription>Please select your primary work sector to get a personalized symptom analysis.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setSector('desk')}><Briefcase className="h-6 w-6"/><span>Desk Work</span></Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setSector('labor')}><HardHat className="h-6 w-6"/><span>Labor</span></Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setSector('sex_worker')}><HeartPulse className="h-6 w-6"/><span>Sex Work</span></Button>
            </CardContent>
        </Card>
      );
  }

  return (
    <div>
        <Button variant="link" onClick={() => { setSector(null); setResult(null); }} className="mb-4">
            &larr; Back to sector selection
        </Button>
        <div className="grid md:grid-cols-2 gap-8 mt-4">
            <SymptomChecker sector={sector} symptoms={symptomsBySector[sector]} onSubmit={handleAnalysis} isPending={isPending} />
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
                                <h4 className="font-semibold text-base">Medication / Treatment</h4>
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
    </div>
  );
}
