import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export async function checkSuspended() {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { suspended: true },
  });

  if (dbUser?.suspended) {
    redirect('/suspended');
  }

  return dbUser;
}
