import { currentUser } from '@repo/auth/server'
import { database } from '@repo/database'
import { redirect } from 'next/navigation'
import { getDictionary, type Locale } from '@repo/internationalization'
import { z } from 'zod'
import { cache } from '@repo/cache'

const searchParamsSchema = z.object({
  tab: z.enum(['financials', 'marketing', 'sales']).optional().default('financials'),
  period: z.string().optional().default('month'),
  view: z.enum(['overview', 'detailed', 'comparison']).optional().default('overview')
})

interface BusinessDashboardPageProps {
  params: Promise<{
    locale: Locale
  }>
  searchParams: Promise<{
    tab?: 'financials' | 'marketing' | 'sales'
    period?: string
    view?: 'overview' | 'detailed' | 'comparison'
  }>
}

export default async function BusinessDashboardPage({ params, searchParams }: BusinessDashboardPageProps) {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const { locale } = await params
  const rawSearchParams = await searchParams
  const validatedParams = searchParamsSchema.parse(rawSearchParams)
  const { tab, period, view } = validatedParams
  const dictionary = await getDictionary(locale)

  const dbUser = await cache.remember(
    `user:${user.id}:business`,
    async () => {
      return database.user.findUnique({
        where: { clerkId: user.id }
      })
    },
    300
  )

  if (!dbUser) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Business Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your business operations and analytics
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-background rounded-[var(--radius-lg)] shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">
            Business dashboard features are under development. Check back soon for:
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            <li>Financial analytics and reporting</li>
            <li>Marketing campaign management</li>
            <li>Sales history and performance</li>
            <li>Revenue tracking and insights</li>
          </ul>
        </div>
      </div>
    </div>
  )
}