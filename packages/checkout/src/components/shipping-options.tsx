'use client';

import {
  FormControl,
  FormField,
  FormItem,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components';
import { Truck } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CheckoutFormData } from '../types';
import { SHIPPING_OPTIONS } from '../utils/calculate-costs';
import { formatCurrency } from '@repo/utils/currency';

interface ShippingOptionsProps {
  form: UseFormReturn<CheckoutFormData>;
  subtotal: number;
}

export function ShippingOptions({ form, subtotal }: ShippingOptionsProps) {
  return (
    <FormField
      control={form.control}
      name="shippingMethod"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="space-y-4"
            >
              {SHIPPING_OPTIONS.map((option) => {
                const isFree = option.freeThreshold && subtotal >= option.freeThreshold;
                const price = isFree ? 0 : option.price;

                return (
                  <div
                    key={option.id}
                    className="relative flex items-center justify-between rounded-lg border p-4 lg:p-4 hover:bg-accent/5 transition-colors"
                    onClick={() => field.onChange(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id} 
                        className="h-6 w-6 lg:h-4 lg:w-4"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex cursor-pointer items-center space-x-3 flex-1"
                      >
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-base lg:text-sm">{option.name}</p>
                          <p className="text-sm lg:text-xs text-muted-foreground">
                            {option.estimatedDays}
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-base lg:text-sm">
                        {price === 0 ? 'FREE' : formatCurrency(price)}
                      </p>
                      {isFree && option.freeThreshold && (
                        <p className="text-xs text-muted-foreground">
                          Free over {formatCurrency(option.freeThreshold)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}