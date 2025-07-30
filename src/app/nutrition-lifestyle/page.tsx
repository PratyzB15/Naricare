import { MentalHealthChatbot } from '@/components/her-health/MentalHealthChatbot';
import { HormonalNutrition } from '@/components/her-health/HormonalNutrition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function NutritionLifestylePage() {
  return (
    <div className="container mx-auto py-8">
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition">Hormonal Nutrition</TabsTrigger>
            <TabsTrigger value="chatbot">Mental Health Chatbot</TabsTrigger>
          </TabsList>
          <TabsContent value="nutrition">
            <HormonalNutrition />
          </TabsContent>
          <TabsContent value="chatbot">
            <MentalHealthChatbot />
          </TabsContent>
        </Tabs>
    </div>
  );
}
