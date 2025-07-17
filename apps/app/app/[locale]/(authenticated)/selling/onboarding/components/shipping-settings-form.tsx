'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Package, Truck } from 'lucide-react';

interface ShippingSettingsData {
  shippingFrom: string;
  processingTime: string;
  defaultShippingCost: string;
  shippingNotes: string;
}

interface ShippingSettingsFormProps {
  data: ShippingSettingsData;
  onUpdate: (data: ShippingSettingsData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ShippingSettingsForm({ data, onUpdate, onNext, onBack }: ShippingSettingsFormProps) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Settings</CardTitle>
        <CardDescription>
          Set your default shipping preferences. You can customize these for each listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="shippingFrom">Ships From</Label>
            <Input
              id="shippingFrom"
              value={formData.shippingFrom}
              onChange={(e) => setFormData({ ...formData, shippingFrom: e.target.value })}
              placeholder="City, State/Country"
              required
            />
            <p className="text-sm text-muted-foreground">
              Buyers will see this location
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processingTime">Processing Time</Label>
            <Select
              value={formData.processingTime}
              onValueChange={(value) => setFormData({ ...formData, processingTime: value })}
            >
              <SelectTrigger id="processingTime">
                <SelectValue placeholder="Select processing time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 business day</SelectItem>
                <SelectItem value="2">2 business days</SelectItem>
                <SelectItem value="3">3 business days</SelectItem>
                <SelectItem value="5">5 business days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How long before you ship after receiving an order
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultShippingCost">Default Shipping Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="defaultShippingCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.defaultShippingCost}
                onChange={(e) => setFormData({ ...formData, defaultShippingCost: e.target.value })}
                className="pl-8"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You can set custom shipping for each item
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingNotes">Shipping Notes (Optional)</Label>
            <Textarea
              id="shippingNotes"
              value={formData.shippingNotes}
              onChange={(e) => setFormData({ ...formData, shippingNotes: e.target.value })}
              placeholder="Any special shipping information buyers should know..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Packaging Tips</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use clean packaging and include a thank you note for better reviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Tracking</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Always provide tracking numbers to protect yourself
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}