import { OccupationalHealth } from '@/components/her-health/OccupationalHealth';
import { AppLayout } from '@/components/layout/AppLayout';

export default function OccupationalHealthPage() {
  return (
    <AppLayout>
      <main className="p-4 md:p-6 lg:p-8">
        <OccupationalHealth />
      </main>
    </AppLayout>
  );
}
