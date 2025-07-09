'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectComponent({ locale }: { locale: string }) {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [locale, router]);
  
  return null;
}