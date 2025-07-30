import { currentUser } from '@repo/auth/server';
import { cache } from '@repo/database';
import { database } from '@repo/database';
import { getDictionary, type Locale } from '@repo/content/internationalization';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const searchParamsSchema = z.object({
  tab: z
    .enum(['financials', 'marketing', 'sales'])
    .optional()
    .default('financials'),
  period: z.string().optional().default('month'),
  view: z
    .enum(['overview', 'detailed', 'comparison'])
    .optional()
    .default('overview'),
});

interface BusinessDashboardPageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams: Promise<{
    tab?: 'financials' | 'marketing' | 'sales';
    period?: string;
    view?: 'overview' | 'detailed' | 'comparison';
  }>;
}

export default async function BusinessDashboardPage({
  params,
  searchParams,
}: BusinessDashboardPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const validatedParams = searchParamsSchema.parse(rawSearchParams);
  const { tab, period, view } = validatedParams;
  const dictionary = await getDictionary(locale);

  const dbUser = await cache.remember(
    `user:${user.id}:business`,
    async () => {
      return database.user.findUnique({
        where: { clerkId: user.id },
      });
    },
    300
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="font-bold text-2xl">Business Dashboard</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your business operations and analytics
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[var(--radius-lg)] bg-background p-6 shadow">
          <h2 className="mb-4 font-semibold text-lg">Coming Soon</h2>
          <p className="text-muted-foreground">
            Business dashboard features are under development. Check back soon
            for:
          </p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground text-sm">
            <li>Financial analytics and reporting</li>
            <li>Marketing campaign management</li>
            <li>Sales history and performance</li>
            <li>Revenue tracking and insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
