'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';

const products = [
  {
    name: 'Sanitary Pads',
    price: '5.99',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'sanitary pads'
  },
  {
    name: 'Tampons',
    price: '7.49',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'tampons hygiene'
  },
  {
    name: 'Menstrual Cup',
    price: '24.99',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'menstrual cup'
  },
  {
    name: 'Pain Relief Medication',
    price: '9.99',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
];

export default function MedicalStorePage() {
  return (
    <AppLayout>
        <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Medical Store</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
            <Card key={product.name}>
                <CardHeader>
                <Image 
                    src={product.image}
                    data-ai-hint={product.dataAiHint}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="rounded-t-lg" 
                />
                </CardHeader>
                <CardContent>
                <CardTitle>{product.name}</CardTitle>
                <p className="text-lg font-semibold text-primary">${product.price}</p>
                </CardContent>
                <CardFooter>
                <Button className="w-full">Add to Cart</Button>
                </CardFooter>
            </Card>
            ))}
        </div>
        </div>
    </AppLayout>
  );
}
