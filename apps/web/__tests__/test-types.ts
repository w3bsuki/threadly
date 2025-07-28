import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

// Image component props
export interface MockImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

// Link component props
export interface MockLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

// Button component props
export interface MockButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

// Card component props
export interface MockCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Input component props
export interface MockInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Label component props
export interface MockLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  htmlFor?: string;
}

// Badge component props
export interface MockBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// Skeleton component props
export interface MockSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Dialog component props
export interface MockDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

// Product type for tests
export interface TestProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  seller: {
    id: string;
    name: string;
  };
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  size?: string;
  brand?: string;
}

// Cart item type for tests
export interface TestCartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Order type for tests
export interface TestOrder {
  id: string;
  items: TestCartItem[];
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}
