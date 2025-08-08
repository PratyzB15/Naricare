'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldAlert, Phone, Hospital, Siren } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type EmergencyService = 'police' | 'hospital' | 'ambulance';

export default function SOSPage() {
  const [sosActivated, setSosActivated] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [message, setMessage] = useState('');

  const handleSOS = () => {
    setSosActivated(true);
  };
  
  const handleServiceSelect = (service: EmergencyService) => {
      setSelectedService(service);
  };

  const handleCall = () => {
    // In a real app, this would trigger a phone call
    alert(`Calling ${selectedService}...`);
  }

  const services = [
      { id: 'police', name: 'Nearby Police', icon: Siren },
      { id: 'hospital', name: 'Nearby Hospital', icon: Hospital },
      { id: 'ambulance', name: 'Ambulance', icon: Phone },
  ] as const;

  return (
    <AppLayout>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
            <CardTitle className="text-3xl text-destructive">SOS Panic Button</CardTitle>
            <CardDescription>
                For immediate emergency assistance.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
            {!sosActivated ? (
                <>
                    <button
                        onClick={handleSOS}
                        className="w-48 h-48 rounded-full bg-destructive/20 border-4 border-destructive flex items-center justify-center animate-pulse"
                    >
                        <div className="w-36 h-36 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
                        <ShieldAlert className="w-16 h-16" />
                        </div>
                    </button>
                    <p className="text-muted-foreground px-4">
                        Press the button to reveal emergency service options.
                    </p>
                </>
            ) : !selectedService ? (
                <div className="w-full space-y-4">
                    <h3 className="text-lg font-semibold">Which service do you need?</h3>
                    {services.map(service => (
                        <Button key={service.id} className="w-full" size="lg" onClick={() => handleServiceSelect(service.id)}>
                            <service.icon className="mr-2 h-5 w-5" />
                            {service.name}
                        </Button>
                    ))}
                     <Button variant="ghost" onClick={() => setSosActivated(false)}>Cancel</Button>
                </div>
            ): (
                 <div className="w-full space-y-4 text-left">
                    <h3 className="text-lg font-semibold text-center">Contacting: {services.find(s => s.id === selectedService)?.name}</h3>
                    <Textarea 
                        placeholder="Optional: Describe your problem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-between items-center">
                         <p className="text-sm text-muted-foreground">Press the button below to call.</p>
                         <Button variant="ghost" onClick={() => setSelectedService(null)}>Back</Button>
                    </div>
                    <Button className="w-full" size="lg" onClick={handleCall}>
                        <Phone className="mr-2 h-5 w-5"/>
                        Call Now
                    </Button>
                </div>
            )}
            </CardContent>
        </Card>
        </div>
    </AppLayout>
  );
}
