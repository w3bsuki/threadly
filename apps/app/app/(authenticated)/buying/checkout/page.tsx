import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { CheckoutContent } from './components/checkout-content';

const title = 'Checkout';
const description = 'Complete your purchase';

export const metadata: Metadata = {
  title,
  description,
};

const CheckoutPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Checkout']} page="Checkout" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your purchase securely
            </p>
          </div>
          
          <CheckoutContent user={user} />
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;