import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../../components/header';
import { SuccessContent } from './components/success-content';

const title = 'Order Successful';
const description = 'Your order has been successfully placed';

export const metadata: Metadata = {
  title,
  description,
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  }>;
}

const CheckoutSuccessPage = async ({ searchParams }: CheckoutSuccessPageProps) => {
  const params = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Extract payment intent ID from either parameter
  const paymentIntentId = params.payment_intent || 
    params.payment_intent_client_secret?.split('_secret_')[0];

  if (!paymentIntentId) {
    redirect('/buying/orders');
  }

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Checkout', 'Success']} page="Success" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <SuccessContent 
            paymentIntentId={paymentIntentId}
            userId={user.id}
          />
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccessPage;