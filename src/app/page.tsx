'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Flower2, Heart, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-background">
          <header className="absolute top-0 left-0 right-0 p-4 flex justify-end">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>हिन्दी (Hindi)</DropdownMenuItem>
                  <DropdownMenuItem>বাংলা (Bengali)</DropdownMenuItem>
                  <DropdownMenuItem>తెలుగు (Telugu)</DropdownMenuItem>
                  <DropdownMenuItem>ಕನ್ನಡ (Kannada)</DropdownMenuItem>
                  <DropdownMenuItem>অসমীয়া (Assamese)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </header>
          <section className="bg-secondary/50 py-12 sm:py-20 lg:py-28">
            <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Your Health, <br />
                  <span className="text-pink-500">Your Priority</span>
                </h1>
                <p className="max-w-md mx-auto lg:mx-0 text-muted-foreground md:text-lg">
                  Comprehensive women's health tracking with period monitoring, fertility insights, and personalized wellness guidance - designed for every woman, everywhere.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-pink-400/80 text-white hover:bg-pink-400">
                    <Link href="/signup">Start Tracking Today</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                     <Link href="/signin">Sign In</Link>
                  </Button>
                </div>
                <div className="flex justify-center lg:justify-start gap-8 pt-4">
                    <div>
                        <p className="font-bold text-pink-500 text-lg">24/7</p>
                        <p className="text-sm text-muted-foreground">Support</p>
                    </div>
                     <div>
                        <p className="font-bold text-green-500 text-lg">100+</p>
                        <p className="text-sm text-muted-foreground">Languages</p>
                    </div>
                     <div>
                        <p className="font-bold text-blue-500 text-lg">Safe</p>
                        <p className="text-sm text-muted-foreground">& Secure</p>
                    </div>
                </div>
              </div>
              <div className="relative">
                 <Image
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAGQCAYAAAByNR6RAAACNUlEQVR4nO3WMQHAQAgEMCgB/6FNND/h1J9I+GMSWgEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIH/gH1rYAA+sMToAAAAABJRU5ErkJggg=="
                    width={600}
                    height={400}
                    alt="Women's Health"
                    className="rounded-xl shadow-2xl"
                 />
                 <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                    <Flower2 className="text-pink-400 h-6 w-6"/>
                 </div>
                 <div className="absolute -bottom-6 left-10 bg-white p-3 rounded-full shadow-lg">
                    <Heart className="text-green-400 h-6 w-6"/>
                 </div>
              </div>
            </div>
          </section>
        </div>
    );
}
