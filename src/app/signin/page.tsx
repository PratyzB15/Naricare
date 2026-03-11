'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Ballpit = dynamic(
  () => import('../../components/animations/ballpit'),
  { ssr: false, loading: () => null }
);

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (email) {
      localStorage.setItem('currentUserEmail', email);
      router.push('/dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 50);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overscrollBehavior = '';
      };
    }
  }, []);

  return (
    // ✅ Misty Rose background: #FFE8E1
    <div 
      className="relative flex items-center justify-center min-h-screen w-full px-4 overflow-hidden"
      style={{ backgroundColor: '#FFE8E1' }}
    >
      {/* 🎈 Ballpit (matte pink balls on Misty Rose bg) */}
      <div className="absolute inset-0 z-0">
        <Ballpit 
          count={120}
          gravity={0.55}
          friction={0.993}
          wallBounce={0.9}
          followCursor={true}
          className="w-full h-full"
        />
      </div>

      {/* 📱 Frosted UI Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="p-8 shadow-xl border-none bg-white/85 backdrop-blur-md rounded-2xl border border-pink-200/40">
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
                  className="border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  className="border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent rounded-lg"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 font-bold py-6 rounded-lg shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="underline text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}