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
  HardHat,
  Quote,
  Moon,
  Sun,
} from 'lucide-react'; // ✅ Correct import – no issue here
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
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

type UserType = 'self' | 'family';

// === Features List ===
const allFeatures = [
  {
    title: 'Period Tracker',
    description: 'Track your cycle, predict periods, and get insights.',
    icon: CalendarDays,
    href: '/period-tracker',
    color: 'text-pink-500 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    keywords: ['period', 'cycle', 'track', 'menstrual'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Nutrition & Lifestyle',
    description: 'Personalized diet and lifestyle recommendations.',
    icon: HeartPulse,
    href: '/nutrition-lifestyle',
    color: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    keywords: ['nutrition', 'diet', 'lifestyle', 'food'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Mental Health Chatbot',
    description: 'Talk to an AI companion for mental wellness.',
    icon: Bot,
    href: '/mental-health-chatbot',
    color: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    keywords: ['mental', 'chatbot', 'therapy', 'emotional'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Pregnancy and Baby Health Tracker',
    description: "Track baby's growth and health via ultrasound.",
    icon: Baby,
    href: '/pregnancy-baby-tracker',
    color: 'text-cyan-500 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    keywords: ['pregnancy', 'baby', 'ultrasound', 'mother'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Cancer Screening',
    description: 'Self-examination guides and symptom analysis.',
    icon: Ribbon,
    href: '/cancer-screening',
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    keywords: ['cancer', 'screening', 'self', 'exam'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Occupational Health',
    description: 'Check for diseases related to labor work.',
    icon: HardHat,
    href: '/occupational-health',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    keywords: ['work', 'labor', 'safety', 'job'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Sex Education',
    description: 'Learn about your body, health, and wellness.',
    icon: BookOpen,
    href: '/sex-education',
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    keywords: ['education', 'body', 'sex', 'wellness'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Medical Store',
    description: 'Shop for pads, tampons, and medicines.',
    icon: ShoppingBag,
    href: '/medical-store',
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    keywords: ['store', 'shop', 'pads', 'medicine'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'Gyno-Consultation',
    description: 'Video call with professional gynecologists.',
    icon: Video,
    href: '/consultation',
    color: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    keywords: ['consult', 'gyno', 'video', 'doctor'],
    userTypes: ['self', 'family'] as UserType[],
  },
  {
    title: 'SOS Panic Button',
    description: 'Immediate help for emergencies.',
    icon: ShieldCheck,
    href: '/sos',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    keywords: ['sos', 'emergency', 'panic', 'help'],
    userTypes: ['self', 'family'] as UserType[],
  },
];

// === Translations ===
const translations = {
  en: {
    dashboard: 'Dashboard',
    explore: 'For more information about the needs to manage your health.',
    features: allFeatures,
    my_account: 'My Account',
    profile: 'Profile',
    sign_out: 'Sign Out',
    coming_soon: 'Coming Soon!',
    voice_assistant_desc: 'AI Voice Assistant will be available in a future update.',
    welcome: 'Welcome',
    her_id: 'Her ID',
    voice_prompt: 'Listening... say "Go to Period Tracker" or "Switch to Hindi"',
    voice_error: 'Could not understand. Try again.',
    voice_navigating: 'Navigating to',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    explore: 'अपने स्वास्थ्य का प्रबंधन करने के लिए उपकरणों का अन्वेषण करें।',
    features: allFeatures.map(f => ({ ...f })),
    my_account: 'मेरा खाता',
    profile: 'प्रोफ़ाइल',
    sign_out: 'साइन आउट',
    coming_soon: 'जल्द आ रहा है!',
    voice_assistant_desc: 'एआई वॉयस असिस्टेंट भविष्य के अपडेट में उपलब्ध होगा।',
    welcome: 'स्वागत है',
    her_id: 'उनकी आईडी',
    voice_prompt: 'सुन रहा है... कहें "पीरियड ट्रैकर पर जाएं" या "हिंदी में बदलें"',
    voice_error: 'समझ नहीं पाया। फिर कोशिश करें।',
    voice_navigating: 'नेविगेट कर रहा है',
  },
  bn: {
    dashboard: 'ড্যািশবোর্ড',
    explore: 'আপনার স্বাস্থ্য পরিচালনার জন্য সরঞ্জামগুলি অন্বেষণ করুন।',
    features: allFeatures.map(f => ({ ...f })),
    my_account: 'আমার অ্যাকাউন্ট',
    profile: 'প্রোফাইল',
    sign_out: 'সাইন আউট',
    coming_soon: 'শীঘ্রই আসছে!',
    voice_assistant_desc: 'AI ধ্বনি সহায়ক ভবিষ্যতে উপলব্ধ হবে।',
    welcome: 'স্বাগতম',
    her_id: 'তার আইডি',
    voice_prompt: 'কেটি আছে... বলুন "পিরিয়ড ট্র্যাকারে যান" বা "বাংলায় স্যুইচ করুন"',
    voice_error: 'বুজিব পারিনি। মতে প্রয়াস করুন।',
    voice_navigating: 'নেভিগেট করা হচ্ছে',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    explore: 'మీ ఆరోగ్యాన్ని నిర్వహించడానికి సాధనాలను అన్వేషించి.',
    features: allFeatures.map(f => ({ ...f })),
    my_account: 'నా ఖాతె',
    profile: 'ప్రొఫైల్',
    sign_out: 'సైన్ ఔట్',
    coming_soon: 'త్వరలో వస్తోంది!',
    voice_assistant_desc: 'AI వాయిస్ అసిస్టెంట్ తదుపరి నవీకరణదల్లి లభ్యమైనది.',
    welcome: 'స్వాగతం',
    her_id: 'ఆమె ఐడి',
    voice_prompt: 'కేటి ఆస్తుంది... "పీరియడ్ ట్రాకర్‌కు వెళ్లండి" లేదా "హిందీకి మారండి" ఎందు హేట్లో',
    voice_error: 'అర్థం చేసుకోలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
    voice_navigating: 'నావిగేట్ చేస్తోంది',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    explore: 'ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ನಿರ್ವಹಿಸಲು ಸಾಧನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
    features: allFeatures.map(f => ({ ...f })),
    my_account: 'ನನ್ನ ಖಾತೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    sign_out: 'ಸೈನ್ ಔಟ್',
    coming_soon: 'ಶೀಘ್ರದಲ್ಲೇ!',
    voice_assistant_desc: 'AI ಧ್ವನಿ ಸಹಾಯಕ ಭವಿಷ್ಯದ ನವೀಕರಣದಲ್ಲಿ ಉಪಲಬ್ಧವಿರುತ್ತದೆ.',
    welcome: 'ಸ್ವಾಗತ',
    her_id: 'ಅವಳ ಐಡಿ',
    voice_prompt: 'ಶುನಿ ಆಸ್ತುಂದಿ... "ಪೀರಿಯಡ್ ಟ್ರ್ಯಾಕರ್‌ಗೆ ಹೋಗಿ" ಅಥವಾ "ಹಿಂದೀಗೆ ಬದಲಾಯಿಸಿ" ಎಂದು ಹೇಳಿ',
    voice_error: 'ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    voice_navigating: 'ನ್ಯಾವಿಗೇಟ್ ಆಗುತ್ತಿದೆ',
  },
  as: {
    dashboard: 'ডেস্কবোৰ্ড',
    explore: 'আপোনাৰ স্বাস্থ্য ৰক্ষাৰ বাবে সঁজুলি সমূহ অন্বেষণ কৰক।',
    features: allFeatures.map(f => ({ ...f })),
    my_account: 'মোৰ একাউণ্ট',
    profile: 'প্ৰফাইল',
    sign_out: 'চাইন আউট',
    coming_soon: 'শীঘ্ৰেই আহিছে!',
    voice_assistant_desc: 'AI ভইচ এছিষ্টেণ্ট ভৱিষ্যতৰ আপডেটত উপলব্ধ হব।',
    welcome: 'স্বাগতম',
    her_id: 'তাইৰ আইডি',
    voice_prompt: 'শুনি আছে... কওক "পিৰিয়ড ট্ৰেকাৰলৈ যাওঁক" বা "হিন্দীলৈ সলাওঁক"',
    voice_error: 'বুজিব পৰা নগল। পুনৰ চেষ্টা কৰক।',
    voice_navigating: 'নেভিগেট কৰি আছে',
  },
};

// === Quotes ===
const quotes = [
  "Every two minutes, a woman dies from preventable causes related to pregnancy or childbirth—95% of these deaths occur in low-resource countries.",
  "If all women in developing countries who wanted to avoid pregnancy used modern contraception, maternal deaths would drop by nearly 70%.",
  "Women make up 70% of the global health workforce, yet hold only 25% of senior leadership roles.",
  "Cervical cancer is nearly 100% preventable, yet it kills over 340,000 women each year—90% in low- and middle-income countries.",
  "One in three women worldwide experiences physical or sexual violence—often with lasting impacts on their health and well-being.",
  "Women produce 60–80% of the food in developing countries, yet own less than 15% of the land they farm.",
  "If women farmers had the same access to resources as men, global food production could increase by up to 4%, reducing world hunger by 17%.",
  "Only 1 in 5 agricultural researchers globally is a woman—and even fewer lead innovation in agritech.",
  "Women are 30% less likely than men to own a mobile phone in low- and middle-income countries—limiting their access to digital farming tools and health info.",
  "When women farmers grow more diverse, nutrient-rich crops using climate-smart tools, child malnutrition drops by up to 33% in their communities.",
];

// Speech Recognition Type Declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>('self');
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [targetUserEmail, setTargetUserEmail] = useState<string | null>(null);
  const [quote, setQuote] = useState('');
  const [language, setLanguage] = useState('en');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load user data
  useEffect(() => {
    setIsClient(true);
    setQuote(quotes[0]);
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/signin');
      return;
    }
    const profile = JSON.parse(localStorage.getItem(`${email}_userProfile`) || '{}');
    const type = localStorage.getItem(`${email}_userType`) as UserType || 'self';
    const id = localStorage.getItem(`${email}_uniqueId`);
    setUserName(profile.name || null);
    setUserType(type);
    setUniqueId(id);
    if (type === 'family') {
      const idMap = JSON.parse(localStorage.getItem('uniqueIdMap') || '{}');
      const femaleUserEmail = id ? idMap[id] : null;
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
    if (savedLang && ['en', 'hi', 'bn', 'te', 'kn', 'as'].includes(savedLang)) {
      setLanguage(savedLang);
    }
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('appLanguage');
      if (newLang && newLang !== language) {
        setLanguage(newLang);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, language, toast]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuote(quotes[quoteIndex]);
  }, [quoteIndex]);

  const handleSignOut = () => {
    localStorage.removeItem('currentUserEmail');
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    router.push('/');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    window.dispatchEvent(new Event('storage'));
    toast({ title: `Language changed to ${lang.toUpperCase()}` });
  };

  const handleNavigation = (href: string) => {
    setIsNavigating(true);
    setTimeout(() => router.push(href), 300);
  };

  // === Voice Assistant ===
  const startVoiceAssistant = () => {
    // Check browser support
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({ variant: 'destructive', title: 'Not Supported', description: 'Your browser does not support speech recognition.' });
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Set language based on current app language
    recognition.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    toast({ title: 'Voice Assistant', description: 'Listening...', duration: 2000 });
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      processVoiceCommand(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({ variant: 'destructive', title: 'Voice Error', description: 'Could not recognize speech.' });
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const processVoiceCommand = (transcript: string) => {
    const t = translations[language as keyof typeof translations] || translations.en;
    // Navigate to features
    for (const feature of allFeatures) {
      if (feature.keywords.some(k => transcript.includes(k))) {
        handleNavigation(feature.href);
        toast({ title: `${t.voice_navigating} ${feature.title}` });
        return;
      }
    }
    // Language switch
    if (transcript.includes('switch to hindi') || transcript.includes('हिंदी में बदलें')) {
      handleLanguageChange('hi');
      return;
    }
    if (transcript.includes('switch to english')) {
      handleLanguageChange('en');
      return;
    }
    if (transcript.includes('switch to bengali') || transcript.includes('বাংলায় স্যুইচ করুন')) {
      handleLanguageChange('bn');
      return;
    }
    if (transcript.includes('switch to telugu')) {
      handleLanguageChange('te');
      return;
    }
    if (transcript.includes('switch to kannada')) {
      handleLanguageChange('kn');
      return;
    }
    if (transcript.includes('switch to assamese') || transcript.includes('হিন্দীলৈ সলাওঁক')) {
      handleLanguageChange('as');
      return;
    }
    // Sign out
    if (transcript.includes('sign out') || transcript.includes('logout')) {
      handleSignOut();
      return;
    }
    // Default
    toast({ variant: 'default', title: t.voice_error });
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const featuresForUser = t.features.filter((f: any) => f.userTypes.includes(userType));

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-lavender-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-lavender-50 dark:bg-slate-900 z-50"
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-lavender-200 dark:bg-purple-900/30 rounded-full opacity-20 dark:opacity-10 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-lavender-300 dark:bg-pink-900/20 rounded-full opacity-15 dark:opacity-10 blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-2/3 left-2/3 w-64 h-64 bg-pink-200 dark:bg-blue-900/20 rounded-full opacity-15 dark:opacity-10 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9InJnYmEoMTQ2LDEwOSwxNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8cGF0aCBkPSJNNTkgMUwxIDU5Ii8+CiAgICA8cGF0aCBkPSJNLTU5IEwxIC01OSIvPgogICAg8cGF0aCBkPSJNNTkgLTFMMSAtNTkiLz4KICA8L2c+Cjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9InJnYmEoMjUsMjUsMjUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8cGF0aCBkPSJNNTkgMUwxIDU5Ii8+CiAgICA8cGF0aCBkPSJNLTU5IEwxIC01OSIvPgogICAg8cGF0aCBkPSJNNTkgLTFMMSAtNTkiLz4KICA8L2c+Cjwvc3ZnPg==')] opacity-10 dark:opacity-20" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 bg-lavender-50/80 dark:bg-slate-800/80 backdrop-blur-md px-4 md:px-6 border-b border-lavender-200 dark:border-slate-700 shadow-sm"
      >
        <motion.div whileHover={{ scale: 1.05 }}>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-lavender-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 bg-clip-text text-transparent">NariCare</h1>
        </motion.div>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-lavender-50 dark:bg-slate-700 border-lavender-300 dark:border-slate-600 hover:bg-lavender-100 dark:hover:bg-slate-600 transition-all"
              onClick={startVoiceAssistant}
              disabled={isListening}
            >
              <Mic className={`h-4 w-4 md:h-5 md:w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-lavender-600 dark:text-purple-300'}`} />
            </Button>
          </motion.div>
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-lavender-50 dark:bg-slate-700 border-lavender-300 dark:border-slate-600">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-lavender-200 dark:border-slate-700 bg-lavender-50 dark:bg-slate-800">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-lavender-50 dark:bg-slate-700 border-lavender-300 dark:border-slate-600">
                <Globe className="h-4 w-4 text-lavender-600 dark:text-purple-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-lavender-200 dark:border-slate-700 bg-lavender-50 dark:bg-slate-800">
              {Object.keys(translations).map(lang => (
                <DropdownMenuItem key={lang} onSelect={() => handleLanguageChange(lang)}>
                  {lang === 'en' && 'English'}
                  {lang === 'hi' && 'हिन्दी (Hindi)'}
                  {lang === 'bn' && 'বাংলা (Bengali)'}
                  {lang === 'te' && 'తెలుగు (Telugu)'}
                  {lang === 'kn' && 'ಕನ್ನಡ (Kannada)'}
                  {lang === 'as' && 'অসমীয়া (Assamese)'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-lavender-50 dark:bg-slate-700 hover:bg-lavender-100 dark:hover:bg-slate-600">
                <User className="h-5 w-5 md:h-6 md:w-6 text-lavender-600 dark:text-purple-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-lavender-200 dark:border-slate-700 bg-lavender-50 dark:bg-slate-800">
              <DropdownMenuLabel>{t.my_account}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-lavender-100 dark:bg-slate-700" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="hover:text-lavender-700 dark:hover:text-purple-300 transition-colors">
                  <User className="mr-2 h-4 w-4 text-lavender-600 dark:text-purple-300" />
                  <span>{t.profile}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.sign_out}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-4 md:mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-lavender-800 dark:text-purple-200 mb-1 md:mb-2 font-serif">
            {t.welcome}{userName ? `, ${userName}` : ''}
          </h2>
          {userType === 'self' && uniqueId && (
            <p className="text-xs md:text-sm text-lavender-600 dark:text-slate-400 mb-1 md:mb-2">
              {t.her_id}: <span className="font-mono bg-lavender-100 dark:bg-slate-700 px-2 py-1 rounded-full text-lavender-700 dark:text-purple-300">{uniqueId}</span>
            </p>
          )}
          <p className="text-lavender-700 dark:text-slate-300 text-sm md:text-base mt-1 md:mt-2 font-light">
            {t.explore}
          </p>
          {!isMobile && (
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8 }}
                className="mt-4 p-4 md:p-6 bg-lavender-50/70 dark:bg-slate-800/60 rounded-xl border border-lavender-200 dark:border-slate-700 shadow-sm max-w-3xl mx-auto backdrop-blur-sm"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <Quote className="h-4 w-4 md:h-6 md:w-6 text-lavender-500 dark:text-purple-400 mt-1" />
                  <p className="text-lavender-700 dark:text-slate-300 italic text-xs md:text-sm leading-relaxed font-serif">{quote}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1 flex flex-col"
          >
            <div className="bg-lavender-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-lavender-200 dark:border-slate-700 p-4 md:p-6 shadow-sm flex-1">
              <h3 className="text-lg md:text-xl font-semibold text-lavender-800 dark:text-purple-200 mb-3 md:mb-4 font-serif">Her Cycle At a Glance</h3>
              <DashboardPeriodCard userType={userType} targetUserEmail={targetUserEmail} />
            </div>
          </motion.div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1 overflow-y-auto pb-2">
            {featuresForUser.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: isMobile ? "0px" : "100px" }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="h-fit"
              >
                <div onClick={() => handleNavigation(feature.href)} className="cursor-pointer">
                  <Card className={`hover:shadow-lg transition-all duration-300 h-full rounded-xl md:rounded-2xl border ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm`}>
                    <CardHeader className="flex flex-row items-start gap-3 md:gap-4 p-4 md:p-5">
                      <motion.div className="rounded-lg md:rounded-xl p-2 md:p-3 bg-white/80 dark:bg-slate-700/60" whileHover={{ rotate: 5 }}>
                        <feature.icon className={`w-4 h-4 md:w-6 md:h-6 ${feature.color}`} />
                      </motion.div>
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 font-serif">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">{feature.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .bg-lavender-50 { background-color: #f8f6fc; }
        .bg-lavender-100 { background-color: #f0ebf8; }
        .bg-lavender-200 { background-color: #e2d9f1; }
        .bg-lavender-300 { background-color: #d4c6ea; }
        .text-lavender-500 { color: #b8a0dc; }
        .text-lavender-600 { color: #aa8dd5; }
        .text-lavender-700 { color: #9c7ace; }
        .text-lavender-800 { color: #8e67c7; }
        .border-lavender-100, .border-lavender-200 { border-color: #e2d9f1; }
      `}</style>
    </div>
  );
}