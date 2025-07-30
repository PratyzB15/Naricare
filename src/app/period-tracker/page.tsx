import { PeriodTracker } from '@/components/her-health/PeriodTracker';
import { Header } from '@/components/her-health/Header';

export default function PeriodTrackerPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <PeriodTracker />
      </main>
    </div>
  );
}
