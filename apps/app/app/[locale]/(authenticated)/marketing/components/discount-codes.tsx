'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Switch } from '@repo/design-system/components';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@repo/design-system/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components';
import { Plus, Copy, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';

const discountSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Value must be a positive number',
  }),
  minimumPurchase: z.string().optional(),
  maxUses: z.string().optional(),
  description: z.string().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountCodesProps {
  userId: string;
}

export function DiscountCodes({ userId }: DiscountCodesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      type: 'PERCENTAGE',
      value: '',
      minimumPurchase: '',
      maxUses: '',
      description: '',
    },
  });

  const onSubmit = async (data: DiscountFormData) => {
    // TODO: Implement discount creation
    setIsOpen(false);
    form.reset();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Mock data for demo
  const discounts = [
    {
      id: '1',
      code: 'SUMMER20',
      type: 'PERCENTAGE',
      value: 20,
      isActive: true,
      currentUses: 15,
      maxUses: 100,
      description: 'Summer sale - 20% off all items',
    },
    {
      id: '2',
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0,
      isActive: true,
      currentUses: 8,
      maxUses: null,
      description: 'Free shipping on all orders',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Create Discount Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Discount Codes</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SUMMER20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                            <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch('type') === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={form.watch('type') === 'PERCENTAGE' ? '20' : '10.00'}
                            {...field}
                            disabled={form.watch('type') === 'FREE_SHIPPING'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimumPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Purchase</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Uses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Summer sale discount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discount Codes List */}
      <div className="grid gap-4">
        {discounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No discount codes created yet</p>
              <Button className="mt-4" size="sm" onClick={() => setIsOpen(true)}>
                Create Your First Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          discounts.map((discount) => (
            <Card key={discount.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-mono">{discount.code}</CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(discount.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {copiedCode === discount.code && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {discount.description}
                    </p>
                  </div>
                  <Switch checked={discount.isActive} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {discount.type === 'PERCENTAGE' && `${discount.value}% OFF`}
                      {discount.type === 'FIXED_AMOUNT' && `$${discount.value} OFF`}
                      {discount.type === 'FREE_SHIPPING' && 'FREE SHIPPING'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {discount.currentUses} / {discount.maxUses || '∞'} uses
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Stats
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}