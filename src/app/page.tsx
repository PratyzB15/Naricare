'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center p-8 max-w-lg mx-auto">
                <h1 className="text-5xl font-bold text-primary-foreground mb-4">Welcome to HerHealthAI</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Your personal AI companion for menstrual health, wellness, and beyond.
                </p>
                <div className="space-x-4">
                    <button 
                        onClick={() => router.push('/signup')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => router.push('/signin')}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
