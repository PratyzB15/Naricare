'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (email) {
      // In a real app, this would be set after successful authentication.
      localStorage.setItem('currentUserEmail', email);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password"  className="font-semibold">Password</Label>
              <Input id="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base py-6">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline text-accent-foreground hover:text-accent-foreground/80 font-semibold">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
