'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Label } from '@repo/design-system/components';
import { Truck, CheckCircle, Package, MessageCircle, Eye } from 'lucide-react';
import { toast } from '@/components/toast';

interface OrderActionsProps {
  orderId: string;
  status: string;
  productTitle: string;
  buyerName: string;
}

export function OrderActions({ orderId, status, productTitle, buyerName }: OrderActionsProps) {
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
        toast.success(`Order for "${productTitle}" has been marked as delivered`);
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
        <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Mark as Shipped
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ship Order</DialogTitle>
              <DialogDescription>
                Mark this order as shipped and provide tracking information for {buyerName}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking">Tracking Number *</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="carrier">Carrier (Optional)</Label>
                <Input
                  id="carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., FedEx, UPS, USPS"
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShipDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShipOrder}
                disabled={isLoading || !trackingNumber.trim()}
              >
                {isLoading ? 'Shipping...' : 'Mark as Shipped'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {status === 'SHIPPED' && (
        <Dialog open={deliverDialogOpen} onOpenChange={setDeliverDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Mark as Delivered
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delivery</DialogTitle>
              <DialogDescription>
                Mark this order as delivered. {buyerName} will be notified and can leave a review.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                By marking this order as delivered, you confirm that:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>The item has been successfully delivered to the buyer</li>
                <li>The buyer will be notified of the delivery</li>
                <li>The buyer can now leave a review for this transaction</li>
              </ul>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeliverDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeliverOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Confirming...' : 'Mark as Delivered'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        View Details
      </Button>
      
      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        Message Buyer
      </Button>
    </div>
  );
}