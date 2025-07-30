import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getDictionary } from '@repo/content/internationalization';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TemplateManager } from './components/template-manager';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
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
      orderBy: { name: 'asc' },
    }),
  ]);

  return { templates, categories };
}

const TemplatesPage = async ({
  params,
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
    select: { id: true },
  });

  if (!dbUser) {
    redirect(`/${locale}/sign-in`);
  }

  const { templates, categories } = await getTemplatesData(dbUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Product Templates
          </h1>
          <p className="text-muted-foreground">
            Create reusable templates to speed up your listing process
          </p>
        </div>
      </div>

      <TemplateManager
        categories={categories}
        dictionary={dictionary}
        initialTemplates={templates}
        locale={locale}
      />
    </div>
  );
};

export default TemplatesPage;
