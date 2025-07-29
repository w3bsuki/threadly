'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui/components';
import type { UseFormReturn } from 'react-hook-form';
import type { CheckoutFormData } from '../types';

interface ContactInfoFormProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function ContactInfoForm({ form }: ContactInfoFormProps) {
  return (
    <div className="grid gap-4 lg:gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base lg:text-sm">First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="given-name"
                  className="h-12 text-base lg:h-10 lg:text-sm"
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
                  autoComplete="family-name"
                  className="h-12 text-base lg:h-10 lg:text-sm"
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
                autoComplete="email"
                className="h-12 text-base lg:h-10 lg:text-sm"
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
                placeholder="(555) 123-4567"
                type="tel"
                {...field}
                autoComplete="tel"
                className="h-12 text-base lg:h-10 lg:text-sm"
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
