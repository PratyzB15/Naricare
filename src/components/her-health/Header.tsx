import { HeartPulse } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-50">
      <div className="flex items-center gap-2 font-semibold">
        <HeartPulse className="h-6 w-6 text-accent-foreground/80" />
        <span className="text-xl font-headline">HerHealthAI</span>
      </div>
    </header>
  );
}
