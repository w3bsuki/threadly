import { currentUser } from '@repo/auth/server';
import { getDictionary } from '@repo/content/internationalization';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '../../../components/header';
import { SuccessContent } from './components/success-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Order Successful',
    description: 'Your order has been successfully placed',
  };
}

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  }>;
}

const CheckoutSuccessPage = async ({
  params,
  searchParams,
}: CheckoutSuccessPageProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const searchParamsData = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Extract payment intent ID from either parameter
  const paymentIntentId =
    searchParamsData.payment_intent ||
    searchParamsData.payment_intent_client_secret?.split('_secret_')[0];

  if (!paymentIntentId) {
    redirect('/buying/orders');
  }

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Success"
        pages={['Dashboard', 'Buying', 'Checkout', 'Success']}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <SuccessContent paymentIntentId={paymentIntentId} userId={user.id} />
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccessPage;
