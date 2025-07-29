import { CartSkeleton } from '@repo/ui/components';

export default function Loading() {
  return (
    <div className="container mx-auto">
      <CartSkeleton />
    </div>
  );
}
