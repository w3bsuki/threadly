'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';
import { Info, Shield } from 'lucide-react';

interface PaymentInfoData {
  bankAccountNumber: string;
  bankRoutingNumber: string;
  accountHolderName: string;
  payoutMethod: string;
}

interface PaymentInfoFormProps {
  data: PaymentInfoData;
  onUpdate: (data: PaymentInfoData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentInfoForm({ data, onUpdate, onNext, onBack }: PaymentInfoFormProps) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Set up how you'll receive payouts when you make sales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is encrypted and secure. We never share your details with buyers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="payoutMethod">Payout Method</Label>
            <Select
              value={formData.payoutMethod}
              onValueChange={(value) => setFormData({ ...formData, payoutMethod: value })}
            >
              <SelectTrigger id="payoutMethod">
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal" disabled>PayPal (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payoutMethod === 'bank_transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder="Name on bank account"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                <Input
                  id="bankRoutingNumber"
                  value={formData.bankRoutingNumber}
                  onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                  placeholder="9-digit routing number"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  type="password"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="Bank account number"
                  required
                />
              </div>
            </>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How payouts work:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Minimum payout amount: $20</li>
                <li>• Request payouts anytime from your dashboard</li>
                <li>• Payouts processed within 3-5 business days</li>
                <li>• 5% platform fee deducted from each sale</li>
              </ul>
            </AlertDescription>
          </Alert>

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