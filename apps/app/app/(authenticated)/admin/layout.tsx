import { requireAdmin } from '@/lib/auth/admin';
import { Card } from '@repo/design-system/components';
import { 
  Users, 
  Package, 
  MessageSquare, 
  AlertTriangle,
  BarChart,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart,
  },
  {
    title: 'Platform Health',
    href: '/admin/health',
    icon: Activity,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: AlertTriangle,
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not admin
  await requireAdmin();

  return (
    <div className="flex h-full">
      {/* Admin Sidebar */}
      <div className="w-64 border-r bg-muted/10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          
          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}