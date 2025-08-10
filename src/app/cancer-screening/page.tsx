import { BreastCancerScreening } from '@/components/her-health/BreastCancerScreening';
import { AppLayout } from '@/components/layout/AppLayout';

export default function CancerScreeningPage() {
  return (
    <AppLayout>
      <main className="container mx-auto py-8">
        <BreastCancerScreening />
      </main>
    </AppLayout>
  );
}
