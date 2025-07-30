import { PeriodTracker } from '@/components/her-health/PeriodTracker';
import { AppLayout } from '@/components/layout/AppLayout';

export default function PeriodTrackerPage() {
  return (
    <AppLayout>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <PeriodTracker />
      </main>
    </AppLayout>
  );
}
