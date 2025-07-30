// Temporarily disabled due to missing flags dependency
// import { getFlags } from '@repo/features/feature-flags/access';

import { NextResponse } from 'next/server';

export const GET = () => {
  return NextResponse.json({ flags: [] });
};
