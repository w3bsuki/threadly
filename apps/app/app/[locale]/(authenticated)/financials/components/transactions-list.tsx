import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Package, CreditCard, RefreshCw, TrendingDown } from 'lucide-react';

interface TransactionsListProps {
  userId: string;
  period: string;
}

export async function TransactionsList({ userId, period }: TransactionsListProps) {
  const transactions = await database.financialTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      order: {
        include: {
          Product: true
        }
      },
      payout: true
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return <Package className="h-4 w-4" />;
      case 'FEE':
        return <CreditCard className="h-4 w-4" />;
      case 'PAYOUT':
        return <DollarSign className="h-4 w-4" />;
      case 'REFUND':
        return <RefreshCw className="h-4 w-4" />;
      case 'EXPENSE':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      SALE: 'default',
      FEE: 'secondary',
      PAYOUT: 'outline',
      REFUND: 'destructive',
      EXPENSE: 'destructive'
    };

    return (
      <Badge variant={variants[type] || 'default'}>
        {type}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIcon(transaction.type)}
                        {getTypeBadge(transaction.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.description || 
                        (transaction.order?.Product?.title && `Sale: ${transaction.order.Product.title}`) ||
                        transaction.category.replace(/_/g, ' ').toLowerCase()}
                    </TableCell>
                    <TableCell>
                      <span className={transaction.type === 'SALE' || transaction.type === 'PAYOUT' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'SALE' || transaction.type === 'PAYOUT' ? '+' : '-'}
                        ${Number(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      ${Number(transaction.netAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}