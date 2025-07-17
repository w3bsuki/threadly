import { Suspense } from 'react'
import { currentUser } from '@repo/auth/server'
import { database } from '@repo/database'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs'
import { FinancialDashboard } from '../financials/components/financial-dashboard'
import { FinancialSkeleton } from '../financials/components/financial-skeleton'
import { MarketingDashboard } from '../marketing/components/marketing-dashboard'
import { SalesHistoryContent } from '../selling/history/components/sales-history-content'
import { getDictionary, type Locale } from '@repo/internationalization'

interface BusinessDashboardPageProps {
  params: Promise<{
    locale: Locale
  }>
  searchParams: Promise<{
    tab?: 'financials' | 'marketing' | 'sales'
    period?: string
    view?: string
  }>
}

export default async function BusinessDashboardPage({ params, searchParams }: BusinessDashboardPageProps) {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const { locale } = await params
  const { tab = 'financials', period = 'month', view = 'overview' } = await searchParams
  const dictionary = await getDictionary(locale)

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  })

  if (!dbUser) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Business Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your financials, marketing, and sales in one place
        </p>
      </div>
      
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financials">
          <Suspense fallback={<FinancialSkeleton />}>
            <FinancialDashboard 
              userId={dbUser.id} 
              period={period}
              view={view as any}
              dictionary={dictionary}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="marketing">
          <MarketingDashboard userId={dbUser.id} />
        </TabsContent>
        
        <TabsContent value="sales">
          <SalesHistoryContent locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}