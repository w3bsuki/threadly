import { database } from '@repo/database';
import { Card, CardContent } from '@repo/design-system/components';
import { decimalToNumber } from '@repo/utils';

interface OrdersStatsProps {
  userId: string;
}

export async function OrdersStats({ userId }: OrdersStatsProps) {
  // Fetch orders for stats calculation
  const orders = await database.order.findMany({
    where: {
      buyerId: userId,
    },
    select: {
      id: true,
      status: true,
      amount: true,
    },
  });

  if (orders.length === 0) {
    return null;
  }

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const inProgressOrders = orders.filter(o => 
    o.status === 'PENDING' || o.status === 'PAID' || o.status === 'SHIPPED'
  ).length;
  const totalSpent = orders.reduce((sum, o) => sum + decimalToNumber(o.amount), 0) / 100;

  return (
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{deliveredOrders}</p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{inProgressOrders}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}