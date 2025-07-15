import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { ensureUserExists } from '@repo/auth/sync';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await ensureUserExists();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get seller's products
    const sellerProducts = await database.product.findMany({
      where: { sellerId: dbUser.id },
      select: { id: true, title: true }
    });

    const productIds = sellerProducts.map(p => p.id);

    // Get customer orders
    const orders = await database.order.findMany({
      where: {
        productId: { in: productIds },
        createdAt: { gte: startDate }
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        product: {
          select: {
            title: true,
            category: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get interactions for additional insights
    const interactions = await database.userInteraction.findMany({
      where: {
        productId: { in: productIds },
        createdAt: { gte: startDate }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Create CSV content
    const csvHeaders = [
      'Customer ID',
      'Customer Name',
      'Customer Email',
      'Total Orders',
      'Total Spent',
      'Average Order Value',
      'First Purchase',
      'Last Purchase',
      'Total Interactions',
      'Customer Type'
    ].join(',');

    // Aggregate customer data
    const customerData = new Map();
    
    orders.forEach(order => {
      const customerId = order.buyerId;
      const customer = order.buyer;
      
      if (!customerData.has(customerId)) {
        customerData.set(customerId, {
          id: customerId,
          name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
          email: customer?.email || 'Unknown',
          orders: [],
          totalSpent: 0,
          interactions: interactions.filter(i => i.userId === customerId).length
        });
      }
      
      const data = customerData.get(customerId);
      data.orders.push(order);
      data.totalSpent += Number(order.total);
    });

    // Calculate averages for customer segmentation
    const totalSpentValues = Array.from(customerData.values()).map(c => c.totalSpent);
    const avgSpending = totalSpentValues.reduce((sum, amount) => sum + amount, 0) / totalSpentValues.length || 0;

    const csvRows = Array.from(customerData.values()).map(customer => {
      const firstPurchase = customer.orders.length > 0 
        ? new Date(Math.min(...customer.orders.map((o: any) => o.createdAt.getTime()))).toISOString().split('T')[0]
        : '';
      const lastPurchase = customer.orders.length > 0
        ? new Date(Math.max(...customer.orders.map((o: any) => o.createdAt.getTime()))).toISOString().split('T')[0]
        : '';
      const avgOrderValue = customer.orders.length > 0 ? customer.totalSpent / customer.orders.length : 0;
      
      // Determine customer type
      let customerType = 'New';
      if (customer.orders.length > 1) customerType = 'Returning';
      if (customer.totalSpent > avgSpending * 2) customerType = 'High Value';
      if (customer.orders.length > 3 && customer.totalSpent > avgSpending) customerType = 'VIP';

      return [
        customer.id,
        `"${customer.name}"`,
        customer.email,
        customer.orders.length,
        customer.totalSpent.toFixed(2),
        avgOrderValue.toFixed(2),
        firstPurchase,
        lastPurchase,
        customer.interactions,
        customerType
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customer-analytics-${range}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Customer analytics export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}