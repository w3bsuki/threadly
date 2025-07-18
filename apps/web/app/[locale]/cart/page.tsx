import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';
import { CartContent } from './components/cart-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return {
    title: 'Cart - Threadly',
    description: 'Your shopping cart',
  };
}

export default function CartPage() {
  return <CartContent />;
}
