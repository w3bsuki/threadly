'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Label } from '@repo/design-system/components';
import { Textarea } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { 
  Send, 
  MessageSquare, 
  Star, 
  Lightbulb, 
  Bug, 
  Heart,
  Loader2
} from 'lucide-react';

const feedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'compliment', 'general']),
  subject: z.string().min(1, 'Subject is required').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  email: z.string().email().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  userEmail?: string;
}

export function FeedbackForm({ userEmail }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: undefined,
      subject: '',
      message: '',
      email: userEmail || '',
      rating: undefined,
    },
  });

  const feedbackTypes = [
    {
      value: 'suggestion' as const,
      label: 'Feature Suggestion',
      icon: Lightbulb,
      description: 'Ideas for new features or improvements'
    },
    {
      value: 'bug' as const,
      label: 'Bug Report',
      icon: Bug,
      description: 'Something isn\'t working as expected'
    },
    {
      value: 'compliment' as const,
      label: 'Compliment',
      icon: Heart,
      description: 'Share what you love about Threadly'
    },
    {
      value: 'general' as const,
      label: 'General Feedback',
      icon: MessageSquare,
      description: 'General thoughts and comments'
    }
  ];

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          rating: selectedRating,
        }),
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        setSelectedRating(undefined);
      } else {
        throw new Error(result.error || 'Failed to send feedback');
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">We'd love your feedback!</h1>
        <p className="text-muted-foreground text-lg">
          Your input helps us make Threadly better for everyone
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What type of feedback is this?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief summary of your feedback" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us more about your experience, suggestion, or issue..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      We'll only use this to follow up on your feedback if needed
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label>How would you rate your overall experience?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={selectedRating === rating ? 'default' : 'outline'}
                      size="sm"
                      className="w-12 h-12 p-0"
                      onClick={() => setSelectedRating(rating)}
                    >
                      <Star className={`h-4 w-4 ${selectedRating && selectedRating >= rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}