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
import { useEffect, useState } from 'react';


const translations = {
    en: {
        title1: "Your Health,",
        title2: "Your Priority",
        description: "Comprehensive women's health tracking with period monitoring, fertility insights, and personalized wellness guidance - designed for every woman, everywhere.",
        start_tracking: "Start Tracking Today",
        sign_in: "Sign In",
        support: "Support",
        languages: "Languages",
        safe_secure: "Safe & Secure"
    },
    hi: {
        title1: "आपका स्वास्थ्य,",
        title2: "आपकी प्राथमिकता",
        description: "पीरियड मॉनिटरिंग, प्रजनन क्षमता की जानकारी और व्यक्तिगत कल्याण मार्गदर्शन के साथ व्यापक महिला स्वास्थ्य ट्रैकिंग - हर महिला के लिए, हर जगह डिज़ाइन किया गया।",
        start_tracking: "आज ही ट्रैकिंग शुरू करें",
        sign_in: "साइन इन करें",
        support: "समर्थन",
        languages: "भाषाएँ",
        safe_secure: "सुरक्षित"
    }
}


export default function WelcomePage() {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('appLanguage');
        if (savedLang && ['en', 'hi'].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        localStorage.setItem('appLanguage', lang);
        window.dispatchEvent(new Event('storage'));
    }
    
    const t = translations[language as keyof typeof translations] || translations.en;

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
                  <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleLanguageChange('hi')}>हिन्दी (Hindi)</DropdownMenuItem>
                  <DropdownMenuItem disabled>বাংলা (Bengali)</DropdownMenuItem>
                  <DropdownMenuItem disabled>తెలుగు (Telugu)</DropdownMenuItem>
                  <DropdownMenuItem disabled>ಕನ್ನಡ (Kannada)</DropdownMenuItem>
                  <DropdownMenuItem disabled>অসমীয়া (Assamese)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </header>
          <section className="bg-secondary/50 py-12 sm:py-20 lg:py-28">
            <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">
                  {t.title1} <br />
                  <span className="text-primary">{t.title2}</span>
                </h1>
                <p className="max-w-md mx-auto lg:mx-0 text-muted-foreground md:text-lg">
                  {t.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/signup">{t.start_tracking}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                     <Link href="/signin">{t.sign_in}</Link>
                  </Button>
                </div>
                <div className="flex justify-center lg:justify-start gap-8 pt-4">
                    <div>
                        <p className="font-bold text-primary text-lg">24/7</p>
                        <p className="text-sm text-muted-foreground">{t.support}</p>
                    </div>
                     <div>
                        <p className="font-bold text-green-500 text-lg">100+</p>
                        <p className="text-sm text-muted-foreground">{t.languages}</p>
                    </div>
                     <div>
                        <p className="font-bold text-blue-500 text-lg">{t.safe_secure}</p>
                        <p className="text-sm text-muted-foreground">& Secure</p>
                    </div>
                </div>
              </div>
              <div className="relative">
                 <Image
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="woman health"
                    width={600}
                    height={400}
                    alt="Women's Health"
                    className="rounded-xl shadow-2xl"
                 />
                 <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                    <Flower2 className="text-primary h-6 w-6"/>
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
