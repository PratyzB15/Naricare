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

export default function SignUpPage() {
  const router = useRouter();
  const [userType, setUserType] = useState('self');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual sign-up logic with Firebase Auth
    // and store user age and medical history
    console.log('Signing up...');
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-md mx-auto p-2">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join HerHealthAI to take control of your health.
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
            
            {userType === 'family' ? (
              <div className="space-y-2">
                <Label htmlFor="uniqueId" className="font-semibold">Female User's Unique ID</Label>
                <Input id="uniqueId" type="text" placeholder="Enter the user's unique ID to track" required />
              </div>
            ) : (
                <>
                 <div className="space-y-2">
                    <Label htmlFor="age" className="font-semibold">Age</Label>
                    <Input id="age" type="number" placeholder="Your age" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="font-semibold">Pre-existing Conditions (optional)</Label>
                    <Textarea id="medicalHistory" placeholder="e.g., Thyroid, PCOS" />
                    <p className="text-xs text-muted-foreground">This helps us personalize your predictions.</p>
                  </div>
                </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password"  className="font-semibold">Password</Label>
              <Input id="password" type="password" required />
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
