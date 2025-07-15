import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CustomerAnalyticsDashboard } from './components/customer-analytics-dashboard';

const title = 'Customer Analytics';
const description = 'Insights into your customer behavior and sales performance';

export const metadata: Metadata = {
  title,
  description,
};

const CustomerAnalyticsPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get user from database
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      id: true,
      SellerProfile: true,
    },
  });

  if (!dbUser?.SellerProfile) {
    redirect('/selling/onboarding');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Analytics</h1>
        <p className="text-muted-foreground">
          Understand your customers and optimize your sales strategy
        </p>
      </div>
      
      <CustomerAnalyticsDashboard sellerId={dbUser.id} />
    </div>
  );
};

export default CustomerAnalyticsPage;