import { PeriodTracker } from '@/components/her-health/PeriodTracker';
import { AppLayout } from '@/components/layout/AppLayout';

export default function PeriodTrackerPage() {
  return (
    <AppLayout>
      <main className="p-4 md:p-6 lg:p-8">
        <PeriodTracker />
      </main>
    </AppLayout>
  );
}
