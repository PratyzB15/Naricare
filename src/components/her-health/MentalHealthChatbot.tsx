'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Loader2, Send, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { mentalHealthChatbotAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';


type ChatMessage = {
  role: 'user' | 'bot';
  content: string;
};

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export function MentalHealthChatbot() {
  const [isPending, startTransition] = useTransition();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const userMessage: ChatMessage = { role: 'user', content: values.message };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    form.reset();

    startTransition(async () => {
      try {
        // Pass the *new* chat history to the action
        const result = await mentalHealthChatbotAction({ 
          message: values.message,
          chatHistory: newChatHistory.slice(0, -1), // Exclude the last user message from history for the prompt
        });
        const botMessage: ChatMessage = { role: 'bot', content: result.response };
        setChatHistory(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chatbot failed:', error);
        toast({
            variant: 'destructive',
            title: 'Chatbot Error',
            description: 'Could not get a response at this time. Please try again later.',
        });
        // Revert to the state before the user sent the message on error
        setChatHistory(chatHistory); 
      }
    });
  };

  return (
    <Card className="shadow-md flex flex-col h-[calc(100vh-4rem)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Bot />
          Mental Health Companion
        </CardTitle>
        <CardDescription>
          Your confidential space to talk about mental wellness.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            {chatHistory.length === 0 ? (
                 <div className="text-center text-muted-foreground pt-16">
                    <p>Welcome! How are you feeling today?</p>
                    <p className="text-xs mt-2">I can help with questions about pre-period, postpartum, and mood swings.</p>
                </div>
            ) : chatHistory.map((chat, index) => (
                <div key={index} className={cn("flex items-start gap-3", chat.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {chat.role === 'bot' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn("p-3 rounded-lg max-w-sm", chat.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                        <p className="text-sm">{chat.content}</p>
                    </div>
                     {chat.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
             {isPending && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
             )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
                <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                            <Input placeholder="Type your message..." {...field} disabled={isPending} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isPending} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
