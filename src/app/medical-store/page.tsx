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
    name: 'Meftal-Spas',
    price: '0.25',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Drotin-M',
    price: '0.35',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Cyclopam',
    price: '0.25',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Spasmo-Proxyvon',
    price: '0.40',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Ibuprofen',
    price: '0.20',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Buscopan',
    price: '0.22',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Naproxen',
    price: '0.40',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Paracetamol',
    price: '0.10',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'painkillers medicine'
  },
  {
    name: 'Rubber Hot Water Bag',
    price: '3.00',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'hot water bag'
  },
  {
    name: 'Electric Heating Bag',
    price: '5.00',
    image: 'https://placehold.co/300x200.png',
    dataAiHint: 'electric heating bag'
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
