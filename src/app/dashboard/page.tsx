'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Bot,
  Baby,
  ShieldCheck,
  Video,
  ShoppingBag,
  HeartPulse,
  User,
  LogOut,
  Ribbon,
  BookOpen,
  Mic,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardPeriodCard } from '@/components/her-health/DashboardPeriodCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    explore: 'Explore the tools to manage your health.',
    features: [
      {
        title: 'Period Tracker',
        description: 'Track your cycle, predict periods, and get insights.',
        icon: CalendarDays,
        href: '/period-tracker',
        color: 'text-pink-500',
        bgColor: 'bg-pink-100/50',
      },
      {
        title: 'Nutrition & Lifestyle',
        description: 'Personalized diet and lifestyle recommendations.',
        icon: HeartPulse,
        href: '/nutrition-lifestyle',
        color: 'text-purple-500',
        bgColor: 'bg-purple-100/50',
      },
      {
        title: 'Mental Health Chatbot',
        description: 'Talk to an AI companion for mental wellness.',
        icon: Bot,
        href: '/mental-health-chatbot',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100/50',
      },
      {
        title: 'Pregnancy and Baby Health Tracker',
        description: "Track baby's growth and health via ultrasound.",
        icon: Baby,
        href: '/pregnancy-baby-tracker',
        color: 'text-teal-500',
        bgColor: 'bg-teal-100/50',
      },
        {
        title: 'Cancer Screening',
        description: 'Self-examination guides and symptom analysis.',
        icon: Ribbon,
        href: '/cancer-screening',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100/50',
      },
      {
        title: 'Sex Education',
        description: 'Learn about your body, health, and wellness.',
        icon: BookOpen,
        href: '/sex-education',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-100/50',
      },
      {
        title: 'Medical Store',
        description: 'Shop for pads, tampons, and medicines.',
        icon: ShoppingBag,
        href: '/medical-store',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100/50',
      },
      {
        title: 'Gyno-Consultation',
        description: 'Video call with professional gynecologists.',
        icon: Video,
        href: '/consultation',
        color: 'text-rose-500',
        bgColor: 'bg-rose-100/50',
      },
      {
        title: 'SOS Panic Button',
        description: 'Immediate help for emergencies.',
        icon: ShieldCheck,
        href: '/sos',
        color: 'text-red-600',
        bgColor: 'bg-red-100/50',
      },
    ],
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    explore: 'अपने स्वास्थ्य का प्रबंधन करने के लिए उपकरणों का अन्वेषण करें।',
    features: [
      {
        title: 'पीरियड ट्रैकर',
        description: 'अपने चक्र को ट्रैक करें, पीरियड्स की भविष्यवाणी करें, और जानकारी प्राप्त करें।',
        icon: CalendarDays,
        href: '/period-tracker',
        color: 'text-pink-500',
        bgColor: 'bg-pink-100/50',
      },
      {
        title: 'पोषण और जीवनशैली',
        description: 'व्यक्तिगत आहार और जीवनशैली की सिफारिशें।',
        icon: HeartPulse,
        href: '/nutrition-lifestyle',
        color: 'text-purple-500',
        bgColor: 'bg-purple-100/50',
      },
      {
        title: 'मानसिक स्वास्थ्य चैटबॉट',
        description: 'मानसिक स्वास्थ्य के लिए एक AI साथी से बात करें।',
        icon: Bot,
        href: '/mental-health-chatbot',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100/50',
      },
      {
        title: 'गर्भावस्था और शिशु स्वास्थ्य ट्रैकर',
        description: 'अल्ट्रासाउंड के माध्यम से बच्चे के विकास और स्वास्थ्य को ट्रैक करें।',
        icon: Baby,
        href: '/pregnancy-baby-tracker',
        color: 'text-teal-500',
        bgColor: 'bg-teal-100/50',
      },
      {
        title: 'कैंसर स्क्रीनिंग',
        description: 'स्व-परीक्षा गाइड और लक्षण विश्लेषण।',
        icon: Ribbon,
        href: '/cancer-screening',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100/50',
      },
      {
        title: 'यौन शिक्षा',
        description: 'अपने शरीर, स्वास्थ्य और कल्याण के बारे में जानें।',
        icon: BookOpen,
        href: '/sex-education',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-100/50',
      },
      {
        title: 'मेडिकल स्टोर',
        description: 'पैड, टैम्पोन और दवाओं की खरीदारी करें।',
        icon: ShoppingBag,
        href: '/medical-store',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100/50',
      },
      {
        title: 'स्त्री रोग विशेषज्ञ परामर्श',
        description: 'पेशेवर स्त्री रोग विशेषज्ञों के साथ वीडियो कॉल करें।',
        icon: Video,
        href: '/consultation',
        color: 'text-rose-500',
        bgColor: 'bg-rose-100/50',
      },
      {
        title: 'एसओएस पैनिक बटन',
        description: 'आपात स्थिति के लिए तत्काल मदद।',
        icon: ShieldCheck,
        href: '/sos',
        color: 'text-red-600',
        bgColor: 'bg-red-100/50',
      },
    ],
  },
};


export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
    } else {
      setCurrentUserEmail(email);
    }
    
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && ['en', 'hi'].includes(savedLang)) {
        setLanguage(savedLang);
    }

  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('currentUserEmail');
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    router.push('/');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  }

  const t = translations[language as keyof typeof translations] || translations.en;


  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-10">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-foreground">{t.dashboard}</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast({ title: 'Coming Soon!', description: 'AI Voice Assistant will be available in a future update.'})}>
              <Mic className="h-5 w-5" />
            </Button>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-10">{t.explore}</p>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <DashboardPeriodCard />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.features.map((feature) => (
                <Link href={feature.href} key={feature.title} className="group">
                <Card className="hover:shadow-2xl hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col p-6 rounded-2xl transform hover:-translate-y-2">
                    <CardHeader className="flex flex-row items-start gap-4 p-0">
                    <div className={`rounded-full p-3 ${feature.bgColor}`}>
                        <feature.icon className={`w-8 h-8 ${feature.color} transition-transform group-hover:scale-110`} />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </div>
                    </CardHeader>
                </Card>
                </Link>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
