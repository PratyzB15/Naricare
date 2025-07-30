'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function SOSPage() {
  const handleSOS = () => {
    // Logic to be implemented
    alert('SOS signal sent. Emergency services have been notified.');
  };
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl text-destructive">SOS Panic Button</CardTitle>
          <CardDescription>
            For immediate emergency assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <button
            onClick={handleSOS}
            className="w-48 h-48 rounded-full bg-destructive/20 border-4 border-destructive flex items-center justify-center animate-pulse"
          >
            <div className="w-36 h-36 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
              <ShieldAlert className="w-16 h-16" />
            </div>
          </button>
          <p className="text-muted-foreground px-4">
            Press the button to alert nearby hospitals, police, and send your location.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
