import { CartSkeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="container mx-auto">
      <CartSkeleton />
    </div>
  );
}
