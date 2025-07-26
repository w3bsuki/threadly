'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import type { CheckoutFormData } from '../types';

interface ContactInfoFormProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function ContactInfoForm({ form }: ContactInfoFormProps) {
  return (
    <div className="grid gap-4 lg:gap-4">
      <div className="grid gap-4 lg:gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base lg:text-sm">First Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="h-12 text-base lg:h-10 lg:text-sm"
                  autoComplete="given-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base lg:text-sm">Last Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="h-12 text-base lg:h-10 lg:text-sm"
                  autoComplete="family-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base lg:text-sm">Email</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                {...field} 
                className="h-12 text-base lg:h-10 lg:text-sm"
                autoComplete="email"
                inputMode="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base lg:text-sm">Phone</FormLabel>
            <FormControl>
              <Input 
                type="tel" 
                placeholder="(555) 123-4567" 
                {...field} 
                className="h-12 text-base lg:h-10 lg:text-sm"
                autoComplete="tel"
                inputMode="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}