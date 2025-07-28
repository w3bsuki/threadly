'use client';

import {
  FormControl,
  FormField,
  FormItem,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components';
import { formatCurrency } from '@repo/utils/currency';
import { Truck } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { CheckoutFormData } from '../types';
import { SHIPPING_OPTIONS } from '../utils/calculate-costs';

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
              className="space-y-4"
              defaultValue={field.value}
              onValueChange={field.onChange}
            >
              {SHIPPING_OPTIONS.map((option) => {
                const isFree =
                  option.freeThreshold && subtotal >= option.freeThreshold;
                const price = isFree ? 0 : option.price;

                return (
                  <div
                    className="relative flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/5 lg:p-4"
                    key={option.id}
                    onClick={() => field.onChange(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        className="h-6 w-6 lg:h-4 lg:w-4"
                        id={option.id}
                        value={option.id}
                      />
                      <Label
                        className="flex flex-1 cursor-pointer items-center space-x-3"
                        htmlFor={option.id}
                      >
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-base lg:text-sm">
                            {option.name}
                          </p>
                          <p className="text-muted-foreground text-sm lg:text-xs">
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
                        <p className="text-muted-foreground text-xs">
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
