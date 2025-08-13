'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userType, setUserType] = useState('self');
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  
  const generateAndStoreUniqueId = (email: string) => {
    const newId = `HER${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(`${email}_uniqueId`, newId);
    
    // In a real app, this map would be stored in a secure backend database.
    const idMap = JSON.parse(localStorage.getItem('uniqueIdMap') || '{}');
    idMap[newId] = email;
    localStorage.setItem('uniqueIdMap', JSON.stringify(idMap));

    return newId;
  }

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem(`${email}_userType`, userType);

    if (userType === 'self') {
        const age = formData.get('age') as string;
        const medicalHistory = formData.get('medicalHistory') as string;
        
        localStorage.setItem(`${email}_userProfile`, JSON.stringify({ name, age: parseInt(age, 10) || null, medicalHistory }));
        
        const newId = generateAndStoreUniqueId(email);
        setUniqueId(newId);

    } else { // family member
        const femaleMemberId = formData.get('femaleMemberId') as string;
        localStorage.setItem(`${email}_userProfile`, JSON.stringify({ name, age: null, medicalHistory: '' }));
        // Store the ID of the user they want to track
        localStorage.setItem(`${email}_uniqueId`, femaleMemberId);
    }


    toast({
        title: 'Account Created!',
        description: 'You will be redirected to the dashboard.',
    });
    
    // We show the unique ID and then redirect if it's a 'self' signup.
    if (userType === 'self') {
        setTimeout(() => {
            router.push('/dashboard');
        }, 4000);
    } else {
        router.push('/dashboard');
    }
  };

  if (uniqueId) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background px-4">
              <Card className="w-full max-w-md p-6">
                <CardHeader>
                    <CardTitle>Welcome to NariCare!</CardTitle>
                    <CardDescription>Your account has been created successfully.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Your Unique ID</AlertTitle>
                        <AlertDescription>
                            Please save this ID. You can share it with family members to let them track your health with your permission.
                            <p className="font-bold text-lg mt-2 break-all">{uniqueId}</p>
                        </AlertDescription>
                    </Alert>
                     <p className="text-sm text-muted-foreground mt-4 text-center">Redirecting you to the dashboard...</p>
                </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join NariCare to take control of your health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-3">
              <Label className="font-semibold">Signing up for:</Label>
              <RadioGroup defaultValue="self" onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                <Label 
                  htmlFor="self"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    userType === 'self' && "border-blue-500"
                  )}
                >
                  <RadioGroupItem value="self" id="self" className="sr-only" />
                  <span>Myself</span>
                </Label>
                <Label 
                   htmlFor="family"
                   className={cn(
                     "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                     userType === 'family' && "border-blue-500"
                   )}
                >
                  <RadioGroupItem value="family" id="family" className="sr-only"/>
                   <span>A Family Member</span>
                </Label>
              </RadioGroup>
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Your Name</Label>
              <Input id="name" name="name" type="text" placeholder="Your full name" required />
            </div>

            {userType === 'family' ? (
              <div className="space-y-2">
                <Label htmlFor="femaleMemberId" className="font-semibold">Female User's Unique ID (HER...)</Label>
                <Input id="femaleMemberId" name="femaleMemberId" type="text" placeholder="Enter the user's ID to track" required />
              </div>
            ) : (
                <>
                 <div className="space-y-2">
                    <Label htmlFor="age" className="font-semibold">Age</Label>
                    <Input id="age" name="age" type="number" placeholder="Your age" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="font-semibold">Pre-existing Conditions (optional)</Label>
                    <Textarea id="medicalHistory" name="medicalHistory" placeholder="e.g., Thyroid, PCOS" />
                    <p className="text-xs text-muted-foreground">This helps us personalize your predictions.</p>
                  </div>
                </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Your Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password"  className="font-semibold">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base py-6">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="underline text-accent-foreground hover:text-accent-foreground/80 font-semibold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
