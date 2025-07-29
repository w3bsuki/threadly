'use client';

import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Package, Truck } from 'lucide-react';
import { useState } from 'react';

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

export function ShippingSettingsForm({
  data,
  onUpdate,
  onNext,
  onBack,
}: ShippingSettingsFormProps) {
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
          Set your default shipping preferences. You can customize these for
          each listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="shippingFrom">Ships From</Label>
            <Input
              id="shippingFrom"
              onChange={(e) =>
                setFormData({ ...formData, shippingFrom: e.target.value })
              }
              placeholder="City, State/Country"
              required
              value={formData.shippingFrom}
            />
            <p className="text-muted-foreground text-sm">
              Buyers will see this location
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processingTime">Processing Time</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, processingTime: value })
              }
              value={formData.processingTime}
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
            <p className="text-muted-foreground text-sm">
              How long before you ship after receiving an order
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultShippingCost">Default Shipping Cost</Label>
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
                $
              </span>
              <Input
                className="pl-8"
                id="defaultShippingCost"
                min="0"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultShippingCost: e.target.value,
                  })
                }
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={formData.defaultShippingCost}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              You can set custom shipping for each item
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingNotes">Shipping Notes (Optional)</Label>
            <Textarea
              id="shippingNotes"
              onChange={(e) =>
                setFormData({ ...formData, shippingNotes: e.target.value })
              }
              placeholder="Any special shipping information buyers should know..."
              rows={3}
              value={formData.shippingNotes}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Packaging Tips</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Use clean packaging and include a thank you note for
                      better reviews
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
                    <p className="mt-1 text-muted-foreground text-xs">
                      Always provide tracking numbers to protect yourself
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button onClick={onBack} type="button" variant="outline">
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
