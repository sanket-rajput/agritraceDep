'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/use-firebase';
import { Tractor } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
  cropType: z.enum(['Wheat', 'Corn', 'Rice', 'Sugarcane', 'Cotton']),
  quantity: z.coerce.number().min(0.1, 'Quantity must be at least 0.1 tons'),
  location: z.string().min(5, 'Please provide a more specific location'),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export function WasteReportForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createReport } = useFirebase();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      location: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to submit a report.',
      });
      return;
    }

    try {
      const id = await createReport({
        ...values,
        farmerId: user.uid,
        farmerName: user.name || user.email,
      });

      toast({
        title: 'Report Submitted!',
        description: `Your request (ID: ${id}) for ${values.quantity} tons of ${values.cropType} has been received.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: (error as any)?.message || 'There was an error submitting your report. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
           <FormField
            control={form.control}
            name="cropType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crop Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a crop type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Corn">Corn</SelectItem>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (in tons)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Farm Road, Green Valley" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'Easy access via main gate'"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90" aria-busy={form.formState.isSubmitting}>
          <Tractor className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? 'Submitting...' : 'Schedule Collection'}
        </Button>
      </form>
    </Form>
  );
}
