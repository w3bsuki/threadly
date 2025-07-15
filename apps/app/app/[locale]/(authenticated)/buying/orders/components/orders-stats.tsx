import { Card, CardContent } from '@repo/design-system/components';
import { getBuyerOrderStats } from '../../../../../../lib/queries/order-stats';

interface OrdersStatsProps {
  userId: string;
}

export async function OrdersStats({ userId }: OrdersStatsProps) {
  const stats = await getBuyerOrderStats(userId);

  if (stats.totalOrders === 0) {
    return null;
  }

  const inProgressOrders = stats.pendingOrders + stats.shippedOrders;

  return (
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
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
            <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}