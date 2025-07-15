import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { MarketingOverview } from './marketing-overview';
import { DiscountCodes } from './discount-codes';
import { FeaturedListings } from './featured-listings';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

interface MarketingDashboardProps {
  userId: string;
  view: 'overview' | 'discounts' | 'featured';
  dictionary: Dictionary;
}

export async function MarketingDashboard({ userId, view, dictionary }: MarketingDashboardProps) {
  return (
    <Tabs value={view} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" asChild>
          <Link href="/marketing?view=overview">Overview</Link>
        </TabsTrigger>
        <TabsTrigger value="discounts" asChild>
          <Link href="/marketing?view=discounts">Discount Codes</Link>
        </TabsTrigger>
        <TabsTrigger value="featured" asChild>
          <Link href="/marketing?view=featured">Featured Listings</Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <MarketingOverview userId={userId} />
      </TabsContent>

      <TabsContent value="discounts" className="space-y-4">
        <DiscountCodes userId={userId} />
      </TabsContent>

      <TabsContent value="featured" className="space-y-4">
        <FeaturedListings userId={userId} />
      </TabsContent>
    </Tabs>
  );
}