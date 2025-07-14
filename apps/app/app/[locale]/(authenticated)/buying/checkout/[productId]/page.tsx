import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../../components/header';
import { SingleProductCheckout } from './components/single-product-checkout';
import { getDictionary } from '@repo/internationalization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; productId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Checkout',
    description: 'Complete your purchase',
  };
}

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
    productId: string;
  }>;
}

const CheckoutPage = async ({ params }: CheckoutPageProps): Promise<React.JSX.Element> => {
  const { locale, productId } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get product details
  const product = await database.product.findUnique({
    where: {
      id: productId,
      status: 'AVAILABLE',
    },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          stripeAccountId: true,
        },
      },
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      category: true,
    },
  });

  if (!product) {
    redirect('/browse');
  }

  // Don't allow buying own products
  if (product.sellerId === user.id) {
    redirect(`/product/${product.id}`);
  }

  // Get user's default shipping address
  const defaultAddress = await database.address.findFirst({
    where: {
      User: { clerkId: user.id },
      type: 'SHIPPING',
      isDefault: true,
    },
  });

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Checkout']} page="Checkout" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Secure checkout powered by Stripe
            </p>
          </div>
          
          <SingleProductCheckout 
            user={user} 
            product={product}
            savedAddress={defaultAddress}
          />
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;