// Legacy exports - deprecated
export {
  createDevelopmentEmailService,
  createProductionEmailService,
  EmailService,
  getEmailService,
} from './email-service';

// New exports - use these instead
export {
  createEmailService,
  type EmailServiceClient,
} from './email-service-client';
export * from './templates';
export type {
  Conversation,
  Message,
  NotificationPreferences,
  Order,
  Payment,
  User,
  UserRepository,
  WeeklyReportData,
} from './types';
