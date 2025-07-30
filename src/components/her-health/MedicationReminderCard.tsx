'use client';

import { useState, useEffect } from 'react';
import { AlarmClock, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export interface Medication {
  id: string;
  name: string;
  time: string; // "HH:mm"
}

interface MedicationReminderCardProps {
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time (HH:mm).'),
});

export function MedicationReminderCard({ medications, setMedications }: MedicationReminderCardProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const intervals = medications.map(med => {
      const checkTime = () => {
        const now = new Date();
        const [hours, minutes] = med.time.split(':');
        if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes) && now.getSeconds() === 0) {
          toast({
            title: 'Medication Reminder',
            description: `It's time to take your ${med.name}.`,
          });
        }
      };
      
      const intervalId = setInterval(checkTime, 1000);
      return intervalId;
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [medications, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      time: '',
    },
  });

  const handleAddMedication = (values: z.infer<typeof formSchema>) => {
    const newMedication: Medication = {
      id: new Date().getTime().toString(),
      ...values,
    };
    setMedications(prev => [...prev, newMedication]);
    toast({ title: 'Reminder Added', description: `${values.name} reminder set for ${values.time}.` });
    form.reset();
    setIsDialogOpen(false);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
    toast({ title: 'Reminder Removed' });
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlarmClock />
          Medication Reminders
        </CardTitle>
        <CardDescription>
          Set alarms for your medications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {medications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No reminders set.</p>
        ) : (
          <ul className="space-y-2">
            {medications.map(med => (
              <li key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.time}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(med.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete reminder for {med.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication Reminder</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddMedication)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Vitamin D" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (24-hour format)</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                   <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                   </DialogClose>
                   <Button type="submit">Add Reminder</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
