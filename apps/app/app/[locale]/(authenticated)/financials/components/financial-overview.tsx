import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag,
  Package,
  CreditCard,
  Calculator
} from 'lucide-react';
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfWeek, endOfMonth, endOfQuarter, endOfYear } from 'date-fns';

interface FinancialOverviewProps {
  userId: string;
  period: string;
}

export async function FinancialOverview({ userId, period }: FinancialOverviewProps) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'quarter':
      startDate = startOfQuarter(now);
      endDate = endOfQuarter(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
  }

  // Get transactions for the period
  const transactions = await database.financialTransaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Calculate totals
  const revenue = transactions
    .filter(t => t.type === 'SALE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const fees = transactions
    .filter(t => t.type === 'FEE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = revenue - expenses - fees;

  // Get order statistics
  const orders = await database.order.count({
    where: {
      sellerId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const pendingPayouts = await database.payout.aggregate({
    where: {
      sellerId: userId,
      status: 'PENDING'
    },
    _sum: {
      amount: true
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${revenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {orders} orders this {period}
          </p>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${expenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Including fees: ${fees.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Net Profit Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          {netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(netProfit).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {((netProfit / revenue) * 100).toFixed(1)}% margin
          </p>
        </CardContent>
      </Card>

      {/* Pending Payouts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${pendingPayouts._sum.amount?.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            Ready for withdrawal
          </p>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Product Sales</span>
              <span className="font-medium">${revenue.toFixed(2)}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Platform Fees</span>
              <span className="font-medium text-red-600">-${fees.toFixed(2)}</span>
            </div>
            <Progress value={(fees / revenue) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Other Expenses</span>
              <span className="font-medium text-red-600">-${expenses.toFixed(2)}</span>
            </div>
            <Progress value={(expenses / revenue) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}