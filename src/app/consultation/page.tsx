'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';

const doctors = [
  {
    name: 'Dr. Emily Carter',
    specialty: 'Gynecology, Obstetrics',
    experience: '12+ years',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'doctor portrait'
  },
  {
    name: 'Dr. Sarah Patel',
    specialty: 'Reproductive Endocrinology',
    experience: '15+ years',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'female doctor'
  },
  {
    name: 'Dr. Jessica Adams',
    specialty: 'Maternal-Fetal Medicine',
    experience: '10+ years',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman doctor'
  },
];

export default function ConsultationPage() {
  return (
    <AppLayout>
        <div className="container mx-auto py-8">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl">Gyno-Consultation</CardTitle>
            <CardDescription>Connect with a professional gynecologist.</CardDescription>
            </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
            <Card key={doctor.name} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                <Image
                    src={doctor.image}
                    width={80}
                    height={80}
                    alt={doctor.name}
                    className="rounded-full"
                    data-ai-hint={doctor.dataAiHint}
                    />
                <div>
                    <CardTitle>{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                </div>
                </CardHeader>
                <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{doctor.experience} of experience</p>
                </CardContent>
                <CardFooter>
                <Button className="w-full">Book a Slot</Button>
                </CardFooter>
            </Card>
            ))}
        </div>
        </div>
    </AppLayout>
  );
}
