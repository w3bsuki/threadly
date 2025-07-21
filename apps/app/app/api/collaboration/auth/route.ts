import { auth, currentUser } from '@repo/auth/server';
import { authenticate } from '@repo/collaboration/auth';
import { authRateLimit, checkRateLimit } from '@repo/security';
import { NextRequest } from 'next/server';

const COLORS = [
  'var(--color-red-500)',
  'var(--color-orange-500)',
  'var(--color-amber-500)',
  'var(--color-yellow-500)',
  'var(--color-lime-500)',
  'var(--color-green-500)',
  'var(--color-emerald-500)',
  'var(--color-teal-500)',
  'var(--color-cyan-500)',
  'var(--color-sky-500)',
  'var(--color-blue-500)',
  'var(--color-indigo-500)',
  'var(--color-violet-500)',
  'var(--color-purple-500)',
  'var(--color-fuchsia-500)',
  'var(--color-pink-500)',
  'var(--color-rose-500)',
];

export const POST = async (request: NextRequest) => {
  // Check rate limit for auth operations
  const rateLimitResult = await checkRateLimit(authRateLimit, request);
  if (!rateLimitResult.allowed) {
    return new Response(
      rateLimitResult.error?.message || 'Rate limit exceeded',
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  const user = await currentUser();
  const { orgId } = await auth();

  if (!user || !orgId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return authenticate({
    userId: user.id,
    orgId,
    userInfo: {
      name:
        user.fullName ?? user.emailAddresses.at(0)?.emailAddress ?? undefined,
      avatar: user.imageUrl ?? undefined,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });
};
