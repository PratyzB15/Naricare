'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, HeartPulse } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    // This will force a re-render of components that use this value
    window.dispatchEvent(new Event('storage')); 
  }

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-50">
      <div className="flex items-center gap-2 font-semibold">
        <HeartPulse className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">NariCare</span>
      </div>
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
  );
}
