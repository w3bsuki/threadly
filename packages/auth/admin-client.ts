import { currentUser, auth } from './server';
import type { UserRepository } from './types';
import { isAdminUser, isModeratorUser } from './types';

export function createAdminClient(userRepository: UserRepository) {
  return {
    requireAdmin: async () => {
      const user = await currentUser();
      const { redirectToSignIn } = await auth();
      
      if (!user) {
        return redirectToSignIn();
      }
      
      const dbUser = await userRepository.findByClerkId(user.id);
      
      if (!isAdminUser(dbUser)) {
        throw new Error('Unauthorized - Admin access required');
      }
      
      return dbUser;
    },

    isAdmin: async () => {
      try {
        const user = await currentUser();
        
        if (!user) {
          return false;
        }
        
        const dbUser = await userRepository.findByClerkId(user.id);
        
        return isAdminUser(dbUser);
      } catch {
        return false;
      }
    },

    canModerate: async () => {
      try {
        const user = await currentUser();
        
        if (!user) {
          return false;
        }
        
        const dbUser = await userRepository.findByClerkId(user.id);
        
        return isModeratorUser(dbUser);
      } catch {
        return false;
      }
    }
  };
}