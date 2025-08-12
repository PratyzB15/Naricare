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
  MapPin,
  HardHat,
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

type UserType = 'self' | 'family';

const allFeatures = [
  {
    title: 'Period Tracker',
    description: 'Track your cycle, predict periods, and get insights.',
    icon: CalendarDays,
    href: '/period-tracker',
    color: 'text-pink-500',
    bgColor: 'bg-pink-100/50',
    userTypes: ['self'],
  },
  {
    title: 'Nutrition & Lifestyle',
    description: 'Personalized diet and lifestyle recommendations.',
    icon: HeartPulse,
    href: '/nutrition-lifestyle',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100/50',
    userTypes: ['self', 'family'],
  },
  {
    title: 'Mental Health Chatbot',
    description: 'Talk to an AI companion for mental wellness.',
    icon: Bot,
    href: '/mental-health-chatbot',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100/50',
    userTypes: ['self'],
  },
  {
    title: 'Pregnancy and Baby Health Tracker',
    description: "Track baby's growth and health via ultrasound.",
    icon: Baby,
    href: '/pregnancy-baby-tracker',
    color: 'text-teal-500',
    bgColor: 'bg-teal-100/50',
    userTypes: ['self'],
  },
    {
    title: 'Cancer Screening',
    description: 'Self-examination guides and symptom analysis.',
    icon: Ribbon,
    href: '/cancer-screening',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100/50',
    userTypes: ['self'],
  },
  {
    title: 'Occupational Health',
    description: 'Check for diseases related to labor work.',
    icon: HardHat,
    href: '/occupational-health',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100/50',
    userTypes: ['self'],
  },
  {
    title: 'Sex Education',
    description: 'Learn about your body, health, and wellness.',
    icon: BookOpen,
    href: '/sex-education',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100/50',
    userTypes: ['self'],
  },
  {
    title: 'Medical Store',
    description: 'Shop for pads, tampons, and medicines.',
    icon: ShoppingBag,
    href: '/medical-store',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100/50',
    userTypes: ['self', 'family'],
  },
  {
    title: 'Gyno-Consultation',
    description: 'Video call with professional gynecologists.',
    icon: Video,
    href: '/consultation',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100/50',
    userTypes: ['self', 'family'],
  },
  {
    title: 'Live Location',
    description: 'View live location if enabled by user.',
    icon: MapPin,
    href: '/location', // This page doesn't exist yet, can be added later
    color: 'text-green-500',
    bgColor: 'bg-green-100/50',
    userTypes: ['family'],
  },
  {
    title: 'SOS Panic Button',
    description: 'Immediate help for emergencies.',
    icon: ShieldCheck,
    href: '/sos',
    color: 'text-red-600',
    bgColor: 'bg-red-100/50',
    userTypes: ['self', 'family'],
  },
];

const translations = {
  en: {
    dashboard: 'Dashboard',
    explore: 'Explore the tools to manage your health.',
    features: allFeatures,
    my_account: 'My Account',
    profile: 'Profile',
    sign_out: 'Sign Out',
    coming_soon: 'Coming Soon!',
    voice_assistant_desc: 'AI Voice Assistant will be available in a future update.',
    welcome: 'Welcome',
    her_id: 'Her ID'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    explore: 'अपने स्वास्थ्य का प्रबंधन करने के लिए उपकरणों का अन्वेषण करें।',
    features: allFeatures.map(f => ({
        ...f,
        title: f.title, // These would need real translations
        description: f.description,
    })),
    my_account: 'मेरा खाता',
    profile: 'प्रोफ़ाइल',
    sign_out: 'साइन आउट',
    coming_soon: 'जल्द आ रहा है!',
    voice_assistant_desc: 'एआई वॉयस असिस्टेंट भविष्य के अपडेट में उपलब्ध होगा।',
    welcome: 'स्वागत है',
    her_id: 'उनकी आईडी'
  },
};


export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>('self');
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [targetUserEmail, setTargetUserEmail] = useState<string | null>(null);

  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    
    setCurrentUserEmail(email);
    const profile = JSON.parse(localStorage.getItem(`${email}_userProfile`) || '{}');
    const type = localStorage.getItem(`${email}_userType`) as UserType || 'self';
    const id = localStorage.getItem(`${email}_uniqueId`);

    setUserName(profile.name || null);
    setUserType(type);
    setUniqueId(id);

    if (type === 'family') {
      const idMap = JSON.parse(localStorage.getItem('uniqueIdMap') || '{}');
      const femaleUserEmail = idMap[id];
      if (femaleUserEmail) {
        setTargetUserEmail(femaleUserEmail);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid ID',
          description: `Could not find a user with the ID: ${id}`,
        });
      }
    } else {
      setTargetUserEmail(email);
    }

    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && ['en', 'hi'].includes(savedLang)) {
        setLanguage(savedLang);
    }

    const handleStorageChange = () => {
        const newLang = localStorage.getItem('appLanguage');
        if (newLang && newLang !== language) {
            setLanguage(newLang);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [router, language, toast]);

  const handleSignOut = () => {
    localStorage.removeItem('currentUserEmail');
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    router.push('/');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    window.dispatchEvent(new Event('storage'));
  }

  const t = translations[language as keyof typeof translations] || translations.en;
  
  const featuresForUser = t.features.filter(f => f.userTypes.includes(userType));


  if (!isClient) {
      return null;
  }

  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-10">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">{t.dashboard}</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast({ title: t.coming_soon, description: t.voice_assistant_desc})}>
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
                <DropdownMenuLabel>{t.my_account}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.profile}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.sign_out}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-10">
            <h2 className="text-3xl font-bold">{t.welcome}{userName ? `, ${userName}`: ''}!</h2>
            {userType === 'self' && uniqueId && <p className="text-sm text-muted-foreground">{t.her_id}: <span className="font-mono bg-muted px-2 py-1 rounded-md">{uniqueId}</span></p>}
            <p className="text-muted-foreground mt-2">{t.explore}</p>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <DashboardPeriodCard userType={userType} targetUserEmail={targetUserEmail} />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuresForUser.map((feature) => (
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
