import { CheckoutSkeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="container mx-auto">
      <CheckoutSkeleton />
    </div>
  );
}