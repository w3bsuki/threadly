'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components';
import { Globe } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

const locales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

export function LanguageSwitcher(): React.JSX.Element {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = (params.locale as string) || 'en';

  const handleLocaleChange = (newLocale: string) => {
    // Replace the current locale in the pathname
    const newPath = pathname.replace(/^\/[^/]+/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Select onValueChange={handleLocaleChange} value={currentLocale}>
      <SelectTrigger className="w-[180px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale.code} value={locale.code}>
            <span className="mr-2">{locale.flag}</span>
            {locale.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
