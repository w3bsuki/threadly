import { CheckoutSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="container mx-auto">
      <CheckoutSkeleton />
    </div>
  );
}