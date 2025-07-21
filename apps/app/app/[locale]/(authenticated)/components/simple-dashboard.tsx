import Link from 'next/link';
import Image from 'next/image';
import type { Dictionary } from '@repo/internationalization';

interface SimpleDashboardProps {
  user: {
    id: string;
    firstName: string | null;
    imageUrl: string;
  };
  dictionary: Dictionary;
  metrics: {
    activeListings: number;
    totalRevenue: number;
    completedSales: number;
    unreadMessages: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    product: {
      id: string;
      title: string;
      images: Array<{
        imageUrl: string;
      }>;
    };
  }>;
}

export function SimpleDashboard({ user, dictionary, metrics, recentOrders }: SimpleDashboardProps): React.JSX.Element {
  const { activeListings, totalRevenue, completedSales, unreadMessages } = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">{dictionary.dashboard.dashboard.title}</h1>
        <p className="text-gray-500 mt-1">
          {dictionary.dashboard.dashboard.welcomeMessage.replace('{{name}}', user.firstName || '')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{dictionary.dashboard.dashboard.metrics.totalRevenue}</p>
            <span className="text-gray-400">💰</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-black">
              ${((totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              {completedSales} {dictionary.dashboard.dashboard.metrics.completedSales}
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{dictionary.dashboard.dashboard.metrics.activeListings}</p>
            <span className="text-gray-400">📦</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-black">{activeListings}</div>
            <p className="text-xs text-gray-500">
              {dictionary.dashboard.dashboard.metrics.itemsCurrentlyForSale}
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{dictionary.dashboard.dashboard.metrics.messages}</p>
            <span className="text-gray-400">💬</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-black">{unreadMessages}</div>
            <p className="text-xs text-gray-500">
              {dictionary.dashboard.dashboard.metrics.unreadMessages}
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{dictionary.dashboard.dashboard.metrics.quickAction}</p>
            <span className="text-gray-400">➕</span>
          </div>
          <div className="mt-2">
            <Link 
              href="/selling/new"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              ➕ {dictionary.dashboard.dashboard.actions.listNewItem}
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">{dictionary.dashboard.dashboard.recentOrders.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{dictionary.dashboard.dashboard.recentOrders.description}</p>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 relative">
                    {order.product.images[0]?.imageUrl ? (
                      <Image
                        src={order.product.images[0].imageUrl}
                        alt={order.product.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {order.product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status === 'DELIVERED' ? dictionary.dashboard.orders.delivered :
                     order.status === 'PENDING' ? dictionary.dashboard.orders.pending :
                     order.status === 'SHIPPED' ? dictionary.dashboard.orders.shipped :
                     order.status.toLowerCase()}
                  </span>
                </div>
              ))}
              <Link 
                href="/buying/orders"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {dictionary.dashboard.dashboard.recentOrders.viewAllOrders}
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl">🛍️</span>
              <h3 className="mt-2 text-sm font-semibold">{dictionary.dashboard.dashboard.recentOrders.noOrdersTitle}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {dictionary.dashboard.dashboard.recentOrders.noOrdersDescription}
              </p>
              <div className="mt-6">
                <a
                  href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  ❤️ {dictionary.dashboard.dashboard.recentOrders.browseShop}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">{dictionary.dashboard.dashboard.quickLinks.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{dictionary.dashboard.dashboard.quickLinks.description}</p>
          
          <div className="space-y-2">
            <Link 
              href="/selling/listings"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              📦 {dictionary.dashboard.dashboard.quickLinks.manageListings}
            </Link>
            <Link 
              href="/selling/history"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              📈 {dictionary.dashboard.dashboard.quickLinks.salesHistory}
            </Link>
            <Link 
              href="/messages"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              💬 {dictionary.dashboard.navigation.messages}
              {unreadMessages > 0 && (
                <span className="ml-auto bg-black text-white text-xs px-2 py-1 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link 
              href="/profile"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              👁️ {dictionary.dashboard.dashboard.quickLinks.profileSettings}
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started (for new users) */}
      {activeListings === 0 && completedSales === 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">{dictionary.dashboard.dashboard.gettingStarted.title}</h3>
          <p className="text-sm text-gray-600 mb-6">{dictionary.dashboard.dashboard.gettingStarted.description}</p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">➕</span>
              </div>
              <h3 className="font-semibold">{dictionary.dashboard.dashboard.gettingStarted.listFirstItem}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {dictionary.dashboard.dashboard.gettingStarted.listItemDescription}
              </p>
              <Link 
                href="/selling/new"
                className="inline-flex items-center mt-3 px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                {dictionary.dashboard.dashboard.gettingStarted.getStarted}
              </Link>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">❤️</span>
              </div>
              <h3 className="font-semibold">{dictionary.dashboard.dashboard.gettingStarted.exploreShop}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {dictionary.dashboard.dashboard.gettingStarted.exploreDescription}
              </p>
              <a
                href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                {dictionary.dashboard.dashboard.gettingStarted.browseNow}
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">👁️</span>
              </div>
              <h3 className="font-semibold">{dictionary.dashboard.dashboard.gettingStarted.completeProfile}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {dictionary.dashboard.dashboard.gettingStarted.profileDescription}
              </p>
              <Link 
                href="/profile"
                className="inline-flex items-center mt-3 px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                {dictionary.dashboard.dashboard.gettingStarted.editProfile}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}