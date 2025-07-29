'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components';
import {
  CheckCircle,
  Eye,
  MoreVertical,
  RotateCcw,
  Trash,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { approveProduct, removeProduct, restoreProduct } from './actions';

interface ProductActionsProps {
  product: {
    id: string;
    title: string;
    status: string;
    sellerId: string;
  };
}

export function ProductActions({
  product,
}: ProductActionsProps): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<{ success: boolean }>) => {
    setIsLoading(true);
    try {
      await action();
      router.refresh();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading} size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/product/${product.id}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View Product
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Status Management */}
        {product.status === 'REMOVED' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => restoreProduct(product.id))}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore Product
          </DropdownMenuItem>
        )}

        {product.status === 'AVAILABLE' && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction(() => approveProduct(product.id))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve (Verify)
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to remove this product?')) {
                  handleAction(() =>
                    removeProduct(product.id, 'Policy violation')
                  );
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Remove Product
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to permanently delete this product?'
              )
            ) {
              // In production, you might want to soft delete instead
              alert('Permanent deletion not implemented for safety');
            }
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete Permanently
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
