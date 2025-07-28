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
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="font-bold text-lg">{stats.totalOrders}</p>
            <p className="text-muted-foreground text-xs">Total Orders</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="font-bold text-lg">{stats.deliveredOrders}</p>
            <p className="text-muted-foreground text-xs">Delivered</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="font-bold text-lg">{inProgressOrders}</p>
            <p className="text-muted-foreground text-xs">In Progress</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="font-bold text-lg">${stats.totalSpent.toFixed(0)}</p>
            <p className="text-muted-foreground text-xs">Total Spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
