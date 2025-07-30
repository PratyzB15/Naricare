'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function ConsultationPage() {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Gyno-Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Connect with a professional gynecologist through a secure video call.
          </p>
          <Video className="w-24 h-24 mx-auto text-primary" />
          <Button size="lg">
            Start Video Call
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
