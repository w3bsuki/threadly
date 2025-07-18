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
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mt-4">
      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-lg font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-lg font-bold">{stats.deliveredOrders}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-lg font-bold">{inProgressOrders}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-lg font-bold">${stats.totalSpent.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}