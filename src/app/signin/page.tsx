'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (email) {
      // Immediately set the user email and redirect
      localStorage.setItem('currentUserEmail', email);
      
      // Use router.push with prefetch for immediate navigation
      router.push('/dashboard');
      
      // Force immediate navigation by also using window.location as fallback
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 50);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-none bg-white/90 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg transition-all duration-200"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 font-bold text-base py-6 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="underline text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}