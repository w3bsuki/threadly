// Legacy admin functions - kept for backward compatibility
// This file will be deprecated in favor of using createAdminClient directly
// DO NOT USE IN NEW CODE - use app-level admin client instead


export const requireAdmin = async () => {
  throw new Error('Direct usage of requireAdmin is deprecated. Use createAdminClient from your app.');
};

export const isAdmin = async () => {
  throw new Error('Direct usage of isAdmin is deprecated. Use createAdminClient from your app.');
};

export const canModerate = async () => {
  throw new Error('Direct usage of canModerate is deprecated. Use createAdminClient from your app.');
};