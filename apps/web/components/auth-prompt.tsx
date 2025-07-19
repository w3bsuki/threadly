import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface AuthPromptProps {
  title: string;
  description: string;
  locale: string;
}

export function AuthPrompt({ title, description, locale }: AuthPromptProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/sign-in`}>
              <Button size="lg" className="w-full sm:w-auto">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            
            <Link href={`/${locale}/sign-up`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </Link>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Join thousands of users buying and selling fashion items on Threadly
          </p>
        </CardContent>
      </Card>
    </div>
  );
}