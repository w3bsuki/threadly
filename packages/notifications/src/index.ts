// Legacy exports - deprecated
export { 
  EmailService, 
  getEmailService, 
  createProductionEmailService, 
  createDevelopmentEmailService 
} from './email-service';

// New exports - use these instead
export { createEmailService, type EmailServiceClient } from './email-service-client';
export type { 
  NotificationPreferences, 
  User, 
  Order, 
  Message, 
  Conversation, 
  Payment, 
  WeeklyReportData,
  UserRepository 
} from './types';

export * from './templates';