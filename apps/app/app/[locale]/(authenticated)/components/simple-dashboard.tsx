import type { Dictionary } from '@repo/content/internationalization';
import Image from 'next/image';
import Link from 'next/link';

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

export function SimpleDashboard({
  user,
  dictionary,
  metrics,
  recentOrders,
}: SimpleDashboardProps): React.JSX.Element {
  const { activeListings, totalRevenue, completedSales, unreadMessages } =
    metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-black">
          {dictionary.dashboard.dashboard.title}
        </h1>
        <p className="mt-1 text-gray-500">
          {dictionary.dashboard.dashboard.welcomeMessage.replace(
            '{{name}}',
            user.firstName || ''
          )}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700 text-sm">
              {dictionary.dashboard.dashboard.metrics.totalRevenue}
            </p>
            <span className="text-gray-400">💰</span>
          </div>
          <div className="mt-2">
            <div className="font-bold text-2xl text-black">
              ${((totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-gray-500 text-xs">
              {completedSales}{' '}
              {dictionary.dashboard.dashboard.metrics.completedSales}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700 text-sm">
              {dictionary.dashboard.dashboard.metrics.activeListings}
            </p>
            <span className="text-gray-400">📦</span>
          </div>
          <div className="mt-2">
            <div className="font-bold text-2xl text-black">
              {activeListings}
            </div>
            <p className="text-gray-500 text-xs">
              {dictionary.dashboard.dashboard.metrics.itemsCurrentlyForSale}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700 text-sm">
              {dictionary.dashboard.dashboard.metrics.messages}
            </p>
            <span className="text-gray-400">💬</span>
          </div>
          <div className="mt-2">
            <div className="font-bold text-2xl text-black">
              {unreadMessages}
            </div>
            <p className="text-gray-500 text-xs">
              {dictionary.dashboard.dashboard.metrics.unreadMessages}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700 text-sm">
              {dictionary.dashboard.dashboard.metrics.quickAction}
            </p>
            <span className="text-gray-400">➕</span>
          </div>
          <div className="mt-2">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800"
              href="/selling/new"
            >
              ➕ {dictionary.dashboard.dashboard.actions.listNewItem}
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg">
            {dictionary.dashboard.dashboard.recentOrders.title}
          </h3>
          <p className="mb-4 text-gray-600 text-sm">
            {dictionary.dashboard.dashboard.recentOrders.description}
          </p>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div className="flex items-center space-x-4" key={order.id}>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                    {order.product.images[0]?.imageUrl ? (
                      <Image
                        alt={order.product.title}
                        className="object-cover"
                        fill
                        sizes="48px"
                        src={order.product.images[0].imageUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {order.product.title}
                    </p>
                    <p className="text-gray-500 text-sm">
                      ${(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status === 'DELIVERED'
                      ? dictionary.dashboard.orders.delivered
                      : order.status === 'PENDING'
                        ? dictionary.dashboard.orders.pending
                        : order.status === 'SHIPPED'
                          ? dictionary.dashboard.orders.shipped
                          : order.status.toLowerCase()}
                  </span>
                </div>
              ))}
              <Link
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
                href="/buying/orders"
              >
                {dictionary.dashboard.dashboard.recentOrders.viewAllOrders}
              </Link>
            </div>
          ) : (
            <div className="py-6 text-center">
              <span className="text-4xl">🛍️</span>
              <h3 className="mt-2 font-semibold text-sm">
                {dictionary.dashboard.dashboard.recentOrders.noOrdersTitle}
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                {
                  dictionary.dashboard.dashboard.recentOrders
                    .noOrdersDescription
                }
              </p>
              <div className="mt-6">
                <a
                  className="inline-flex items-center rounded-md bg-black px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800"
                  href={
                    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'
                  }
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  ❤️ {dictionary.dashboard.dashboard.recentOrders.browseShop}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg">
            {dictionary.dashboard.dashboard.quickLinks.title}
          </h3>
          <p className="mb-4 text-gray-600 text-sm">
            {dictionary.dashboard.dashboard.quickLinks.description}
          </p>

          <div className="space-y-2">
            <Link
              className="flex w-full items-center rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
              href="/selling/listings"
            >
              📦 {dictionary.dashboard.dashboard.quickLinks.manageListings}
            </Link>
            <Link
              className="flex w-full items-center rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
              href="/selling/history"
            >
              📈 {dictionary.dashboard.dashboard.quickLinks.salesHistory}
            </Link>
            <Link
              className="flex w-full items-center rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
              href="/messages"
            >
              💬 {dictionary.dashboard.navigation.messages}
              {unreadMessages > 0 && (
                <span className="ml-auto rounded-full bg-black px-2 py-1 text-white text-xs">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              className="flex w-full items-center rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
              href="/profile"
            >
              👁️ {dictionary.dashboard.dashboard.quickLinks.profileSettings}
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started (for new users) */}
      {activeListings === 0 && completedSales === 0 && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg">
            {dictionary.dashboard.dashboard.gettingStarted.title}
          </h3>
          <p className="mb-6 text-gray-600 text-sm">
            {dictionary.dashboard.dashboard.gettingStarted.description}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl">➕</span>
              </div>
              <h3 className="font-semibold">
                {dictionary.dashboard.dashboard.gettingStarted.listFirstItem}
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                {
                  dictionary.dashboard.dashboard.gettingStarted
                    .listItemDescription
                }
              </p>
              <Link
                className="mt-3 inline-flex items-center rounded-md bg-black px-3 py-1 text-sm text-white transition-colors hover:bg-gray-800"
                href="/selling/new"
              >
                {dictionary.dashboard.dashboard.gettingStarted.getStarted}
              </Link>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl">❤️</span>
              </div>
              <h3 className="font-semibold">
                {dictionary.dashboard.dashboard.gettingStarted.exploreShop}
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                {
                  dictionary.dashboard.dashboard.gettingStarted
                    .exploreDescription
                }
              </p>
              <a
                className="mt-3 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50"
                href={
                  process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                {dictionary.dashboard.dashboard.gettingStarted.browseNow}
              </a>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl">👁️</span>
              </div>
              <h3 className="font-semibold">
                {dictionary.dashboard.dashboard.gettingStarted.completeProfile}
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                {
                  dictionary.dashboard.dashboard.gettingStarted
                    .profileDescription
                }
              </p>
              <Link
                className="mt-3 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50"
                href="/profile"
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
