'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  toast,
} from '@repo/ui/components';
import { CheckCircle, Eye, MessageCircle, Package, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrderActionsProps {
  orderId: string;
  status: string;
  productTitle: string;
  buyerName: string;
}

export function OrderActions({
  orderId,
  status,
  productTitle,
  buyerName,
}: OrderActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);

  const handleShipOrder = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          carrier: carrier.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Order for "${productTitle}" has been marked as shipped`);
        setShipDialogOpen(false);
        setTrackingNumber('');
        setCarrier('');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to ship order');
      }
    } catch (error) {
      toast.error('Failed to ship order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Order for "${productTitle}" has been marked as delivered`
        );
        setDeliverDialogOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to mark order as delivered');
      }
    } catch (error) {
      toast.error('Failed to mark order as delivered. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {status === 'PAID' && (
        <Dialog onOpenChange={setShipDialogOpen} open={shipDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1" size="sm">
              <Truck className="h-3 w-3" />
              Mark as Shipped
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ship Order</DialogTitle>
              <DialogDescription>
                Mark this order as shipped and provide tracking information for{' '}
                {buyerName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking">Tracking Number *</Label>
                <Input
                  disabled={isLoading}
                  id="tracking"
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                />
              </div>

              <div>
                <Label htmlFor="carrier">Carrier (Optional)</Label>
                <Input
                  disabled={isLoading}
                  id="carrier"
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., FedEx, UPS, USPS"
                  value={carrier}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => setShipDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading || !trackingNumber.trim()}
                onClick={handleShipOrder}
              >
                {isLoading ? 'Shipping...' : 'Mark as Shipped'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {status === 'SHIPPED' && (
        <Dialog onOpenChange={setDeliverDialogOpen} open={deliverDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1" size="sm">
              <CheckCircle className="h-3 w-3" />
              Mark as Delivered
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delivery</DialogTitle>
              <DialogDescription>
                Mark this order as delivered. {buyerName} will be notified and
                can leave a review.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="text-muted-foreground text-sm">
                By marking this order as delivered, you confirm that:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground text-sm">
                <li>The item has been successfully delivered to the buyer</li>
                <li>The buyer will be notified of the delivery</li>
                <li>The buyer can now leave a review for this transaction</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => setDeliverDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isLoading} onClick={handleDeliverOrder}>
                {isLoading ? 'Confirming...' : 'Mark as Delivered'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Button className="flex items-center gap-1" size="sm" variant="outline">
        <Eye className="h-3 w-3" />
        View Details
      </Button>

      <Button className="flex items-center gap-1" size="sm" variant="outline">
        <MessageCircle className="h-3 w-3" />
        Message Buyer
      </Button>
    </div>
  );
}
