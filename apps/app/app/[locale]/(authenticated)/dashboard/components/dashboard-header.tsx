import type { Dictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';

interface DashboardHeaderProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
}

export function DashboardHeader({ user, dictionary }: DashboardHeaderProps) {
  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user.firstName || 'there';

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {getGreeting()}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        {dictionary.dashboard.dashboard.welcomeMessage.replace('{{name}}', firstName)}
      </p>
    </div>
  );
}