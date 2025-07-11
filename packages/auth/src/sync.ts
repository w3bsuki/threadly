import { currentUser } from '@clerk/nextjs/server';
import { database } from '@repo/database';

export async function ensureUserExists() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  try {
    // Check if user exists in database
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      include: { preferences: true }
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
        },
        include: { preferences: true }
      });

      // Create default preferences
      await database.userPreferences.create({
        data: {
          userId: dbUser.id,
          preferredRole: 'BUYER',
          interests: [],
          favoriteBrands: [],
          onboardingCompleted: false,
        },
      });

      // User created successfully
    } else if (!dbUser.preferences) {
      // Ensure preferences exist
      await database.userPreferences.create({
        data: {
          userId: dbUser.id,
          preferredRole: 'BUYER',
          interests: [],
          favoriteBrands: [],
          onboardingCompleted: false,
        },
      });
    }

    return dbUser;
  } catch (error) {
    // Don't throw - allow request to continue even if sync fails
    // Don't throw - allow request to continue even if sync fails
    return null;
  }
}

export async function getUserWithSync(clerkId: string) {
  let user = await database.user.findUnique({
    where: { clerkId },
    include: { preferences: true, sellerProfile: true }
  });

  if (!user) {
    // Trigger sync
    const syncedUser = await ensureUserExists();
    if (syncedUser) {
      // Fetch again with all includes
      user = await database.user.findUnique({
        where: { clerkId },
        include: { preferences: true, sellerProfile: true }
      });
    }
  }

  return user;
}