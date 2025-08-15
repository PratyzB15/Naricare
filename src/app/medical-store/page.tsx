import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';
import { Separator } from '@/components/ui/separator';
import { Baby, Heart, Pilcrow } from 'lucide-react';

const pregnancyProducts = [
  { name: 'Folic Acid Supplements', price: '9.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'supplements medicine' },
  { name: 'Iron & Calcium Tablets', price: '14.50', image: 'https://placehold.co/300x200.png', dataAiHint: 'supplements medicine' },
  { name: 'Maternity Pads', price: '8.00', image: 'https://placehold.co/300x200.png', dataAiHint: 'maternity pads' },
  { name: 'Stretch Mark Cream', price: '12.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'stretch mark cream' },
  { name: 'Pregnancy Test Kit', price: '4.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'pregnancy test kit' },
  { name: 'Maternity Support Belt', price: '25.00', image: 'https://placehold.co/300x200.png', dataAiHint: 'maternity belt' },
];

const babyProducts = [
  { name: 'Newborn Diapers (Pampers)', price: '15.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'diapers baby' },
  { name: 'Baby Wipes (Huggies)', price: '3.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'baby wipes' },
  { name: 'Cerelac (Stage 1)', price: '6.49', image: 'https://placehold.co/300x200.png', dataAiHint: 'baby food' },
  { name: 'Johnson\'s Baby Oil', price: '5.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'baby oil' },
  { name: 'Diaper Rash Cream (Sudocrem)', price: '8.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'diaper rash cream' },
  { name: 'Baby Formula (Nan Pro)', price: '22.00', image: 'https://placehold.co/300x200.png', dataAiHint: 'baby formula' },
  { name: 'Gripe Water', price: '4.50', image: 'https://placehold.co/300x200.png', dataAiHint: 'gripe water' },
  { name: 'Baby Shampoo', price: '6.99', image: 'https://placehold.co/300x200.png', dataAiHint: 'baby shampoo' },
];


const hygieneProducts = [
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

const painReliefProducts = [
    { name: 'Meftal-Spas', price: '0.25', image: 'https://placehold.co/300x200.png', dataAiHint: 'painkillers medicine' },
    { name: 'Drotin-M', price: '0.35', image: 'https://placehold.co/300x200.png', dataAiHint: 'painkillers medicine' },
    { name: 'Cyclopam', price: '0.25', image: 'https://placehold.co/300x200.png', dataAiHint: 'painkillers medicine' },
    { name: 'Ibuprofen', price: '0.20', image: 'https://placehold.co/300x200.png', dataAiHint: 'painkillers medicine' },
    { name: 'Paracetamol', price: '0.10', image: 'https://placehold.co/300x200.png', dataAiHint: 'painkillers medicine' },
];

const ProductGrid = ({ products }: { products: typeof hygieneProducts }) => (
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
            <p className="text-lg font-semibold text-primary">₹{product.price}</p>
            </CardContent>
            <CardFooter>
            <Button className="w-full">Add to Cart</Button>
            </CardFooter>
        </Card>
        ))}
    </div>
);

export default function MedicalStorePage() {
  return (
    <AppLayout>
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Medical Store</h1>
            
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Heart className="text-pink-500" /> For Pregnant Mothers</h2>
                <ProductGrid products={pregnancyProducts} />
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-12">
                 <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Baby className="text-blue-500" /> For Newborn Babies</h2>
                <ProductGrid products={babyProducts} />
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-12">
                 <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Pilcrow className="text-red-500" /> Feminine Hygiene</h2>
                <ProductGrid products={hygieneProducts} />
            </section>

             <Separator className="my-8" />

            <section>
                 <h2 className="text-2xl font-semibold mb-4">Pain & Cramp Relief</h2>
                <ProductGrid products={painReliefProducts} />
            </section>

        </div>
    </AppLayout>
  );
}