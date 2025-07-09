import type { Dictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';

interface DashboardHeaderProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
}

export function DashboardHeader({ user, dictionary }: DashboardHeaderProps) {
  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        {dictionary.dashboard.dashboard.title}
      </h1>
      <p className="text-muted-foreground mt-1">
        {dictionary.dashboard.dashboard.welcomeMessage.replace('{{name}}', user.firstName || '')}
      </p>
    </div>
  );
}