'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  age: number | null;
  medicalHistory: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({ name: '', age: null, medicalHistory: '' });
  const [isClient, setIsClient] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    setCurrentUserEmail(email);
    const savedProfile = localStorage.getItem(`${email}_userProfile`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [router]);

  const handleSignOut = () => {
    // In a real app, you'd clear tokens, etc.
    localStorage.removeItem('currentUserEmail');
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    router.push('/');
  };
  
  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUserEmail) return;
      localStorage.setItem(`${currentUserEmail}_userProfile`, JSON.stringify(profile));
      toast({ title: 'Profile Saved', description: 'Your information has been updated.' });
  }

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>View and manage your personal information.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSave}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                            id="name" 
                            type="text"
                            value={profile.name || ''}
                            onChange={(e) => setProfile({...profile, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                            id="age" 
                            type="number"
                            value={profile.age || ''}
                            onChange={(e) => setProfile({...profile, age: e.target.valueAsNumber })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="medicalHistory">Pre-existing Conditions</Label>
                        <Textarea 
                            id="medicalHistory"
                            value={profile.medicalHistory}
                            onChange={(e) => setProfile({...profile, medicalHistory: e.target.value })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <Button onClick={handleSignOut} variant="destructive" className="w-full">Sign Out</Button>
                     <Button asChild variant="outline">
                        <Link href="/privacy">Privacy Information</Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
