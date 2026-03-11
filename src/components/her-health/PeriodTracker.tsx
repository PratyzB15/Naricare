'use client';

import { useState, useEffect, useTransition } from 'react';
import type { DateRange } from 'react-day-picker';
import { differenceInDays, formatISO, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarCard } from '@/components/her-health/CalendarCard';
import { CyclePhaseCard } from '@/components/her-health/CyclePhaseCard';
import { predictPeriodAction } from '@/app/actions';
import { 
  AlertTriangle, 
  HeartPulse, 
  Info, 
  Droplet, 
  Baby, 
  CalendarX,
  Calendar,
  Heart,
  AlertCircle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

// Define blood color types - must match what predictPeriodAction expects
type BloodColorType = 'Bright Red' | 'Dark Red/Brown' | 'Black' | 'Pink' | 'Orange' | 'Gray' | 'Not Applicable';

export type PeriodCycle = { 
  start: Date; 
  end: Date;
  type: 'period' | 'no_period';
  bloodColor?: Exclude<BloodColorType, 'Not Applicable'>; // Can't be 'Not Applicable' for actual cycles
  mood?: string;
  symptoms?: string;
};

export type PeriodPrediction = {
  predictedStartDate: string;
  confidence: number;
  reasoning: string;
  healthAnalysis?: string;
  flowPrediction?: string;
  bloodColorAnalysis?: string;
  cyclePhase?: string;
  phaseDescription?: string;
  emotionalState?: string;
  phaseSymptoms?: string;
};

// Color options for blood color selection - only actual colors, not 'Not Applicable'
const colorOptions: Array<Exclude<BloodColorType, 'Not Applicable'>> = [
  'Bright Red',
  'Dark Red/Brown',
  'Black',
  'Pink',
  'Orange',
  'Gray'
];

// Helper function to validate blood color
const isValidBloodColor = (color: string): color is Exclude<BloodColorType, 'Not Applicable'> =>
  colorOptions.includes(color as any);

// Color display data for UI
const colorDisplayData = {
  'Bright Red': { colorClass: 'bg-red-600', description: 'Fresh flow', status: 'normal' as const },
  'Dark Red/Brown': { colorClass: 'bg-amber-900', description: 'Older blood', status: 'normal' as const },
  'Black': { colorClass: 'bg-black', description: 'Oxidized', status: 'monitor' as const },
  'Pink': { colorClass: 'bg-pink-300', description: 'Low estrogen/anemia', status: 'warning' as const },
  'Orange': { colorClass: 'bg-orange-500', description: 'Possible infection', status: 'warning' as const },
  'Gray': { colorClass: 'bg-gray-400', description: 'Urgent concern', status: 'alert' as const },
};

export function PeriodTracker() {
  const router = useRouter();
  const { toast } = useToast();
  const [, startPredictionTransition] = useTransition();
  const [userProfile, setUserProfile] = useState<{ age: number | null; medicalHistory: string }>({ 
    age: null, 
    medicalHistory: '' 
  }); 
  const [isClient, setIsClient] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [prediction, setPrediction] = useState<PeriodPrediction | null>(null);
  const [flowFeedback, setFlowFeedback] = useState('');
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date | null>(null);
  const [noPeriodThisMonth, setNoPeriodThisMonth] = useState(false);
  
  // New state for blood color feature
  const [selectedColor, setSelectedColor] = useState<Exclude<BloodColorType, 'Not Applicable'> | null>(null);
  const [periodOccurred, setPeriodOccurred] = useState<boolean>(true);
  const [mood, setMood] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [bloodColorLoading, setBloodColorLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    setCurrentUserEmail(email);

    // Load data from localStorage to simulate a logged-in user
    const savedProfile = localStorage.getItem(`${email}_userProfile`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    const savedCycles = localStorage.getItem(`${email}_periodCycles`);
    if (savedCycles) {
      const parsedCycles = JSON.parse(savedCycles).map((c: any) => ({ 
        ...c, 
        start: new Date(c.start), 
        end: new Date(c.end),
        type: c.type || 'period',
        bloodColor: c.bloodColor && isValidBloodColor(c.bloodColor) ? c.bloodColor as Exclude<BloodColorType, 'Not Applicable'> : undefined
      }));
      setCycles(parsedCycles);
    }
    
    const savedPregnancy = localStorage.getItem(`${email}_pregnancyStartDate`);
    if (savedPregnancy) {
        setPregnancyStartDate(new Date(savedPregnancy));
    }

  }, [router]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isClient || !currentUserEmail) return;
    localStorage.setItem(`${currentUserEmail}_periodCycles`, JSON.stringify(cycles));
    if (prediction) {
      localStorage.setItem(`${currentUserEmail}_periodPrediction`, JSON.stringify(prediction));
    }
    if (pregnancyStartDate) {
        localStorage.setItem(`${currentUserEmail}_pregnancyStartDate`, pregnancyStartDate.toISOString());
    } else {
        localStorage.removeItem(`${currentUserEmail}_pregnancyStartDate`);
    }
  }, [cycles, prediction, pregnancyStartDate, isClient, currentUserEmail]);
  

  const handlePrediction = (newCycles: PeriodCycle[]) => {
    if(newCycles.length === 0 || pregnancyStartDate) return;

    startPredictionTransition(async () => {
      try {
        // Only use period cycles for prediction, not no_period cycles
        const periodCycles = newCycles.filter(cycle => cycle.type === 'period');
        const pastCycleData = periodCycles.map(c => ({
            start: formatISO(c.start, { representation: 'date' }),
            end: formatISO(c.end, { representation: 'date' }),
            bloodColor: c.bloodColor || undefined,
            mood: c.mood || undefined,
            symptoms: c.symptoms || undefined
        }));

        // Determine blood color for API - must match the type expected by predictPeriodAction
        let bloodColorForApi: BloodColorType | undefined;
        if (periodOccurred) {
          if (selectedColor && isValidBloodColor(selectedColor)) {
            bloodColorForApi = selectedColor;
          } else {
            bloodColorForApi = undefined; // Use undefined instead of 'Not Specified'
          }
        } else {
          bloodColorForApi = 'Not Applicable';
        }

        const result = await predictPeriodAction({
          pastCycleData,
          mood: mood || 'calm',
          physicalSymptoms: symptoms || 'None',
          age: userProfile.age || undefined,
          medicalHistory: userProfile.medicalHistory,
          bloodColor: bloodColorForApi,
          periodOccurred,
          flowFeedback
        });
        setPrediction(result);
        if (result) {
            toast({
              title: 'Prediction Updated',
              description: 'Your next period has been predicted based on your latest cycle.',
            });
        }
      } catch (error) {
        console.error('Auto-prediction failed:', error);
        toast({
            variant: 'destructive',
            title: 'Prediction Error',
            description: 'Could not get prediction at this time. Please try again later.',
        });
      }
    });
  };

  useEffect(() => {
    if(isClient && cycles.length > 0 && currentUserEmail) {
        const savedPrediction = localStorage.getItem(`${currentUserEmail}_periodPrediction`);
        if (savedPrediction) {
          setPrediction(JSON.parse(savedPrediction));
        } else {
            handlePrediction(cycles);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles.length, isClient, currentUserEmail]); // Depend on length to re-trigger on add/remove

  useEffect(() => {
    if (prediction?.predictedStartDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const predictedDate = new Date(prediction.predictedStartDate);
      const daysUntil = differenceInDays(predictedDate, today);

      if (daysUntil === 2) {
        toast({
          title: 'Period Reminder',
          description: `Your period is predicted to start in 2 days, on ${predictedDate.toLocaleDateString()}.`,
        });
      }
    }
  }, [prediction, toast]);

  const handleLogPeriod = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const newCycle: PeriodCycle = { 
        start: range.from, 
        end: range.to, 
        type: 'period',
        bloodColor: selectedColor || undefined,
        mood: mood || undefined,
        symptoms: symptoms || undefined
      };
      const updatedCycles = [...cycles, newCycle].sort((a, b) => a.start.getTime() - b.start.getTime());
      setCycles(updatedCycles);
      toast({
        title: 'Cycle Logged',
        description: `Your period from ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()} has been logged.`,
      });
      handlePrediction(updatedCycles);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Logging Period',
        description: 'Please select a start and end date for your period.',
      });
    }
  };

  const handleNoPeriodThisMonth = () => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    
    // Check if we already have a no_period entry for this month
    const hasNoPeriodThisMonth = cycles.some(cycle => 
      cycle.type === 'no_period' && 
      cycle.start.getTime() === currentMonthStart.getTime() &&
      cycle.end.getTime() === currentMonthEnd.getTime()
    );

    if (hasNoPeriodThisMonth) {
      toast({
        variant: 'destructive',
        title: 'Already Logged',
        description: 'You have already logged no period for this month.',
      });
      return;
    }

    const noPeriodCycle: PeriodCycle = { 
      start: currentMonthStart, 
      end: currentMonthEnd, 
      type: 'no_period' 
    };
    
    const updatedCycles = [...cycles, noPeriodCycle].sort((a, b) => a.start.getTime() - b.start.getTime());
    setCycles(updatedCycles);
    setNoPeriodThisMonth(false);
    
    toast({
      title: 'No Period Logged',
      description: 'Marked this month as having no period.',
    });
    
    handlePrediction(updatedCycles);
  };

  const runBloodColorAnalysis = async () => {
    if (periodOccurred && !selectedColor) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select blood color if period occurred',
      });
      return;
    }

    setBloodColorLoading(true);
    try {
      const periodCycles = cycles.filter(cycle => cycle.type === 'period');
      const pastCycleData = periodCycles.map(c => ({
          start: formatISO(c.start, { representation: 'date' }),
          end: formatISO(c.end, { representation: 'date' }),
          bloodColor: c.bloodColor || undefined,
          mood: c.mood || undefined,
          symptoms: c.symptoms || undefined
      }));

      // Determine blood color for API - must match the type expected by predictPeriodAction
      let bloodColorForApi: BloodColorType | undefined;
      if (periodOccurred) {
        if (selectedColor && isValidBloodColor(selectedColor)) {
          bloodColorForApi = selectedColor;
        } else {
          bloodColorForApi = undefined; // Use undefined instead of 'Not Specified'
        }
      } else {
        bloodColorForApi = 'Not Applicable';
      }

      const result = await predictPeriodAction({
        pastCycleData,
        mood: mood || 'calm',
        physicalSymptoms: symptoms || 'None',
        age: userProfile.age || undefined,
        medicalHistory: userProfile.medicalHistory,
        bloodColor: bloodColorForApi,
        periodOccurred,
        flowFeedback
      });
      setPrediction(result);
      toast({
        title: 'Analysis Complete',
        description: 'Your period data has been analyzed and prediction updated.',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: 'Failed to analyze. Please try again.',
      });
    } finally {
      setBloodColorLoading(false);
    }
  };
  
  const lastCycle = cycles.length > 0 ? cycles[cycles.length - 1] : undefined;
  const cycleHistory = cycles.slice().reverse();
  const pregnancyWeeks = pregnancyStartDate ? Math.floor(differenceInDays(new Date(), pregnancyStartDate) / 7) : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!isClient || !currentUserEmail) {
      return null;
  }
  
  if (pregnancyWeeks !== null && pregnancyWeeks < 50) {
      return (
         <div className="lg:col-span-3">
             <Alert>
                <Baby className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2 text-2xl">
                    Pregnancy Mode
                </AlertTitle>
                <AlertDescription>
                   Period tracking is paused during your pregnancy. You are approximately {pregnancyWeeks} weeks pregnant.
                </AlertDescription>
                <CardContent className="pt-4 px-0">
                    <p>Congratulations! Your period tracker is paused. Head over to the Pregnancy & Baby Tracker for weekly updates on your baby's development.</p>
                </CardContent>
             </Alert>
         </div>
      );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <CalendarCard
          cycles={cycles}
          prediction={prediction}
          onLogPeriod={handleLogPeriod}
        />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Logged Periods</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {cycles.filter(c => c.type === 'period').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Predicted Period</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {prediction?.predictedStartDate ? formatDate(prediction.predictedStartDate) : '--/--/----'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Color Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Droplet className="h-5 w-5" />
              Blood Color Analysis
            </CardTitle>
            <CardDescription>
              Select your blood color for health insights and better predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* No Period This Month Check */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="noPeriodCheckbox"
                checked={!periodOccurred}
                onCheckedChange={(checked) => {
                  setPeriodOccurred(!checked);
                  if (checked) {
                    setSelectedColor(null);
                  }
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="noPeriodCheckbox" className="font-medium text-gray-800 cursor-pointer">
                  I didn't have my period this month
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Check this box to log it and adjust predictions.
                </p>
              </div>
            </div>

            {periodOccurred && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {colorOptions.map((color) => {
                    const displayData = colorDisplayData[color];
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedColor === color
                            ? 'border-pink-500 bg-pink-50 shadow-md'
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-full ${displayData.colorClass} shadow-sm`} />
                          {displayData.status !== 'normal' && (
                            <AlertCircle className={`w-4 h-4 ${
                              displayData.status === 'alert' ? 'text-red-500' : 
                              displayData.status === 'warning' ? 'text-orange-500' : 
                              'text-yellow-500'
                            }`} />
                          )}
                        </div>
                        <p className="font-semibold text-sm text-gray-800">{color}</p>
                        <p className="text-xs text-gray-500 mt-1">{displayData.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Mood & Symptoms Inputs */}
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Mood
                    </Label>
                    <input
                      type="text"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g., Happy, Anxious, Tired"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Physical Symptoms
                    </Label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., Cramps, fatigue, bloating"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24"
                    />
                  </div>
                </div>

                <Button
                  onClick={runBloodColorAnalysis}
                  disabled={bloodColorLoading || !selectedColor}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
                >
                  {bloodColorLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </span>
                  ) : 'Analyze & Update Prediction'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* No Period This Month Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              No Period This Month
            </CardTitle>
            <CardDescription>
              If you didn't have your period this month, check this box to log it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="no-period" 
                checked={noPeriodThisMonth}
                onCheckedChange={(checked) => setNoPeriodThisMonth(checked as boolean)}
              />
              <Label htmlFor="no-period" className="cursor-pointer">
                I didn't have my period this month
              </Label>
            </div>
            {noPeriodThisMonth && (
              <Button 
                onClick={handleNoPeriodThisMonth} 
                className="mt-4"
                variant="outline"
              >
                Confirm No Period
              </Button>
            )}
          </CardContent>
        </Card>

        {prediction?.flowPrediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet />
                Predicted Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">{prediction.flowPrediction}</p>
              </div>
              <div className="pt-4">
                <CardDescription className="mb-2">Did your flow match the prediction? Let us know to improve future predictions.</CardDescription>
                <Textarea
                  placeholder="e.g., 'My flow was heavier on the first day than predicted.'"
                  value={flowFeedback}
                  onChange={(e) => setFlowFeedback(e.target.value)}
                />
                <div className="flex gap-3 mt-3">
                  <Button className="flex-1 flex items-center justify-center gap-2" variant="outline">
                    <ThumbsUp className="w-4 h-4" />
                    Matched
                  </Button>
                  <Button className="flex-1 flex items-center justify-center gap-2" variant="outline">
                    <ThumbsDown className="w-4 h-4" />
                    Different
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Blood Color Analysis Result */}
        {selectedColor && periodOccurred && (
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-800">
                <Droplet className="h-5 w-5" />
                Blood Color Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-6 h-6 rounded-full ${
                  colorDisplayData[selectedColor]?.colorClass
                }`} />
                <span className="font-medium">{selectedColor}</span>
              </div>
              <p className="text-gray-700">
                {prediction?.bloodColorAnalysis || 
                 colorDisplayData[selectedColor]?.description}
              </p>
              {(selectedColor === 'Gray' || selectedColor === 'Orange') && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 mt-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700 font-medium">
                    Consider consulting a healthcare provider
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {prediction?.healthAnalysis && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle />
                Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{prediction.healthAnalysis}</p>
            </CardContent>
          </Card>
        )}
        
        <CyclePhaseCard lastCycleStart={lastCycle?.type === 'period' ? lastCycle.start : undefined} />
        
        {/* Cycle Phase with AI */}
        {prediction?.cyclePhase && (
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Calendar className="h-5 w-5" />
                Current Cycle Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-indigo-700 mb-2">
                {prediction.cyclePhase}
              </p>
              <p className="text-gray-700 text-sm mb-3">
                {prediction.phaseDescription}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                {prediction.emotionalState && (
                  <p><span className="font-medium">Mood:</span> {prediction.emotionalState}</p>
                )}
                {prediction.phaseSymptoms && (
                  <p><span className="font-medium">Symptoms:</span> {prediction.phaseSymptoms}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {cycleHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info />
                Cycle History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {cycleHistory.map((cycle, index) => (
                  <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      {cycle.type === 'no_period' ? (
                        <span className="text-muted-foreground">
                          Month of {cycle.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: No period
                        </span>
                      ) : (
                        `Cycle ${cycleHistory.length - index}: ${cycle.start.toLocaleDateString()} - ${cycle.end.toLocaleDateString()}`
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {prediction && !prediction.healthAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse />
                Prediction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600">Next Period</p>
                <p className="text-lg font-bold text-gray-800">
                  {prediction.predictedStartDate ? formatDate(prediction.predictedStartDate) : 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Confidence Level</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-gray-800">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              </div>
              {prediction.reasoning && (
                <div>
                  <p className="text-gray-600">Reasoning</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                    {prediction.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Flow Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-pink-600" />
              Flow Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Light Flow', color: 'bg-green-500' },
                { label: 'Medium Flow', color: 'bg-yellow-500' },
                { label: 'Heavy Flow', color: 'bg-red-500' }
              ].map((flow, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{flow.label}</span>
                  <div className={`w-3 h-3 rounded-full ${flow.color}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}