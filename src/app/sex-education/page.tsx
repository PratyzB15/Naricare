import { AppLayout } from '@/components/layout/AppLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { BookOpen, Heart, Shield, Droplets } from 'lucide-react';

const sections = [
  {
    value: 'item-1',
    title: 'Understanding Your Body',
    icon: Heart,
    image: 'https://storage.googleapis.com/gemini-studio-assets/project-images/7a68a5c3-8a2b-4654-a957-61c0c325e683.png',
    dataAiHint: 'female anatomy',
    content: (
      <>
        <h4 className="font-semibold">Anatomy Basics</h4>
        <p>Knowing the names and functions of your body parts is the first step to understanding your health.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Vulva:</strong> The outer part of the female genitals, including the clitoris and labia.</li>
          <li><strong>Vagina:</strong> The muscular tube connecting the cervix to the outside of the body.</li>
          <li><strong>Cervix:</strong> The lower part of the uterus that opens into the vagina.</li>
          <li><strong>Uterus:</strong> A pear-shaped organ where a fetus grows during pregnancy.</li>
          <li><strong>Ovaries:</strong> Two organs that produce eggs and hormones like estrogen and progesterone.</li>
        </ul>
        <h4 className="font-semibold mt-4">Normal Discharge</h4>
        <p>Vaginal discharge is normal. It's usually clear or whitish and helps clean and protect the vagina from infection.</p>
      </>
    ),
  },
  {
    value: 'item-2',
    title: 'How Menstruation Happens (The Menstrual Cycle)',
    icon: Droplets,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'menstrual cycle diagram',
    content: (
      <>
        <p className="mb-2">An average cycle is about 28 days but can range from 21 to 35 days.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Days 1–5: Menstrual Phase</strong>
            <p className="font-normal text-sm text-muted-foreground">The uterus sheds its inner lining, which results in bleeding (your period). This typically lasts 3–7 days.</p>
          </li>
          <li>
            <strong>Days 6–14: Follicular Phase</strong>
            <p className="font-normal text-sm text-muted-foreground">The brain releases Follicle Stimulating Hormone (FSH), prompting the ovaries to prepare eggs. The uterine lining begins to thicken again.</p>
          </li>
          <li>
            <strong>Day 14: Ovulation</strong>
            <p className="font-normal text-sm text-muted-foreground">Luteinizing Hormone (LH) surges, causing an ovary to release a mature egg. This is your most fertile time.</p>
          </li>
          <li>
            <strong>Days 15–28: Luteal Phase</strong>
            <p className="font-normal text-sm text-muted-foreground">If the egg isn't fertilized, hormone levels drop, and the uterine lining breaks down, starting the next period. If fertilized, pregnancy begins.</p>
          </li>
        </ol>
      </>
    ),
  },
  {
    value: 'item-3',
    title: 'Consent & Boundaries',
    icon: Shield,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
          <li>Consent must be <strong>clear, enthusiastic, and ongoing</strong>. It's an active "yes," not the absence of a "no."</li>
          <li>You have the right to change your mind at any time during any sexual activity.</li>
          <li>No one should ever pressure, guilt-trip, or force you into any sexual act. Your boundaries are valid and must be respected.</li>
        </ul>
      </>
    )
  },
    {
    value: 'item-4',
    title: 'Sexual & Reproductive Health',
    icon: Heart,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Protection:</strong> Condoms are unique in that they prevent both pregnancy and Sexually Transmitted Infections (STIs). Other forms of birth control (pills, IUDs, implants) do not prevent STIs.</li>
            <li><strong>STI Prevention:</strong> Regular check-ups and testing are key to maintaining sexual health. The HPV vaccine is highly effective at preventing cervical cancer and genital warts.</li>
            <li><strong>Pap Smear:</strong> It is recommended to have a Pap smear every 3 years after age 21 (or as advised by your doctor) to screen for cervical cancer.</li>
        </ul>
      </>
    )
  },
   {
    value: 'item-5',
    title: 'Pregnancy Awareness',
    icon: Shield,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Fertile Window:</strong> The most likely time to get pregnant is the 5-6 days leading up to and including ovulation day.</li>
            <li><strong>Pregnancy Signs:</strong> Common early signs include a missed period, nausea (morning sickness), and breast soreness.</li>
            <li><strong>Emergency Contraception:</strong> This can be used after unprotected sex to prevent pregnancy and is most effective within the first 72 hours.</li>
        </ul>
      </>
    )
  },
   {
    value: 'item-6',
    title: 'Sexual Comfort & Pleasure',
    icon: Heart,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Foreplay:</strong> This is an important part of sexual activity that helps with physical comfort and natural lubrication.</li>
            <li><strong>Pain is Not Normal:</strong> If you experience pain during sex, it's important to talk to a doctor. It could be a sign of an infection, dryness, or another medical condition.</li>
            <li><strong>Masturbation:</strong> This is a normal and safe way to explore your body and what feels good. However, if it becomes an extreme addiction that interferes with daily life, seeking help is recommended.</li>
        </ul>
      </>
    )
  },
   {
    value: 'item-7',
    title: 'Emotional & Mental Well-being',
    icon: Shield,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
            <li>Healthy sexuality is about more than just physical health; it includes feeling safe, respected, and well-informed.</li>
            <li>If you ever face pressure, abuse, or trauma related to sexuality, it is vital to seek help from a trusted friend, family member, or a professional counselor immediately.</li>
        </ul>
      </>
    )
  },
   {
    value: 'item-8',
    title: 'Hygiene & Safety',
    icon: Heart,
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Washing:</strong> Use water and gentle, unscented soap to wash your vulva (the outside parts). Douching (washing inside the vagina) is not recommended as it disrupts the natural balance of bacteria.</li>
            <li><strong>Underwear:</strong> Wear cotton underwear and change it daily to allow the area to breathe and reduce the risk of infection.</li>
            <li><strong>Urination After Sex:</strong> Peeing after intercourse can help flush out bacteria from the urinary tract and prevent Urinary Tract Infections (UTIs).</li>
        </ul>
      </>
    )
  },
];

export default function SexEducationPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit">
                 <BookOpen className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl mt-2">Sex Education Hub</CardTitle>
            <CardDescription>
              Answering your questions about sexual and reproductive health with clear, reliable information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section) => (
                <AccordionItem value={section.value} key={section.title}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-pink-500" />
                        {section.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none grid md:grid-cols-2 gap-8 items-center">
                        <div>
                             {section.content}
                        </div>
                        {section.image && (
                           <div className="relative aspect-video">
                                <Image
                                    src={section.image}
                                    alt={section.title}
                                    fill
                                    className="rounded-lg object-contain"
                                    data-ai-hint={section.dataAiHint}
                                />
                           </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}