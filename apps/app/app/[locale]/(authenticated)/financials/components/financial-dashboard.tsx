import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import { FinancialOverview } from './financial-overview';
import { TransactionsList } from './transactions-list';
import { TaxReports } from './tax-reports';
import { ExpenseTracker } from './expense-tracker';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

interface FinancialDashboardProps {
  userId: string;
  period: string;
  view: 'overview' | 'transactions' | 'reports' | 'expenses';
  dictionary: Dictionary;
}

export async function FinancialDashboard({ userId, period, view, dictionary }: FinancialDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Link href={`/financials?period=week&view=${view}`}>
            <Button variant={period === 'week' ? 'default' : 'outline'} size="sm">
              Week
            </Button>
          </Link>
          <Link href={`/financials?period=month&view=${view}`}>
            <Button variant={period === 'month' ? 'default' : 'outline'} size="sm">
              Month
            </Button>
          </Link>
          <Link href={`/financials?period=quarter&view=${view}`}>
            <Button variant={period === 'quarter' ? 'default' : 'outline'} size="sm">
              Quarter
            </Button>
          </Link>
          <Link href={`/financials?period=year&view=${view}`}>
            <Button variant={period === 'year' ? 'default' : 'outline'} size="sm">
              Year
            </Button>
          </Link>
        </div>
        
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={view} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" asChild>
            <Link href={`/financials?period=${period}&view=overview`}>
              Overview
            </Link>
          </TabsTrigger>
          <TabsTrigger value="transactions" asChild>
            <Link href={`/financials?period=${period}&view=transactions`}>
              Transactions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="reports" asChild>
            <Link href={`/financials?period=${period}&view=reports`}>
              Tax Reports
            </Link>
          </TabsTrigger>
          <TabsTrigger value="expenses" asChild>
            <Link href={`/financials?period=${period}&view=expenses`}>
              Expenses
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinancialOverview userId={userId} period={period} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsList userId={userId} period={period} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <TaxReports userId={userId} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseTracker userId={userId} period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
}