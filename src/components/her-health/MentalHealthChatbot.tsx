'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BotMessageSquare, Loader2, Send, Sparkles, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { mentalHealthChatbotAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type ChatMessage = {
    role: 'user' | 'bot';
    content: string;
}

export function MentalHealthChatbot() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'bot', content: "Hello! I'm here to support you. How are you feeling today?" }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [chatHistory]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const userMessage: ChatMessage = { role: 'user', content: values.message };
    setChatHistory(prev => [...prev, userMessage]);
    form.reset();

    startTransition(async () => {
      try {
        const result = await mentalHealthChatbotAction({ message: values.message, chatHistory });
        const botMessage: ChatMessage = { role: 'bot', content: result.response };
        setChatHistory(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chatbot failed:', error);
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description: 'Could not get a response. Please try again later.',
        });
        setChatHistory(prev => prev.slice(0, -1));
      }
    });
  };

  return (
    <Card className="shadow-lg border-primary/20 h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotMessageSquare />
          Mental Wellness Companion
        </CardTitle>
        <CardDescription>
          A safe space to talk about your feelings. I'm here to listen and support you.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {msg.role === 'bot' && (
                             <Avatar className="w-8 h-8 border">
                                <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles className="w-5 h-5"/></AvatarFallback>
                             </Avatar>
                        )}
                        <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                            <p>{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                             <Avatar className="w-8 h-8 border">
                                <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                             </Avatar>
                        )}
                    </div>
                ))}
                 {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="w-8 h-8 border">
                            <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles className="w-5 h-5"/></AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary text-secondary-foreground rounded-lg p-3 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
             <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                            <Input placeholder="Type your message..." {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" size="icon" disabled={isPending}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
