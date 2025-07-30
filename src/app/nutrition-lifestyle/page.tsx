import { HormonalNutrition } from '@/components/her-health/HormonalNutrition';
import { AppLayout } from '@/components/layout/AppLayout';


export default function NutritionLifestylePage() {
  return (
    <AppLayout>
        <div className="container mx-auto py-8">
            <HormonalNutrition />
        </div>
    </AppLayout>
  );
}
