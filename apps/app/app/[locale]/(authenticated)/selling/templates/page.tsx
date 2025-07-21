import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getDictionary } from '@repo/internationalization';
import { TemplateManager } from './components/template-manager';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Product Templates',
    description: 'Manage your product listing templates',
  };
}

async function getTemplatesData(userId: string) {
  const [templates, categories] = await Promise.all([
    // TODO: Add ProductTemplate model to database schema
    Promise.resolve([]),
    database.category.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return { templates, categories };
}

const TemplatesPage = async ({ 
  params 
}: { 
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    redirect(`/${locale}/sign-in`);
  }

  const { templates, categories } = await getTemplatesData(dbUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Templates</h1>
          <p className="text-muted-foreground">
            Create reusable templates to speed up your listing process
          </p>
        </div>
      </div>

      <TemplateManager 
        initialTemplates={templates}
        categories={categories}
        locale={locale}
        dictionary={dictionary}
      />
    </div>
  );
};

export default TemplatesPage;