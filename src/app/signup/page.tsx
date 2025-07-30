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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join HerHealthAI to take control of your health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label>Signing up for:</Label>
              <RadioGroup defaultValue="self" onValueChange={setUserType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">Myself</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="family" id="family" />
                  <Label htmlFor="family">A Family Member</Label>
                </div>
              </RadioGroup>
            </div>
            
            {userType === 'family' ? (
              <div className="space-y-2">
                <Label htmlFor="uniqueId">Female User's Unique ID</Label>
                <Input id="uniqueId" type="text" placeholder="Enter the user's unique ID to track" required />
              </div>
            ) : (
                <>
                 <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="Your age" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Pre-existing Conditions (optional)</Label>
                    <Textarea id="medicalHistory" placeholder="e.g., Thyroid, PCOS" />
                    <p className="text-xs text-muted-foreground">This helps us personalize your predictions.</p>
                  </div>
                </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="underline text-accent-foreground hover:text-accent-foreground/80">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
