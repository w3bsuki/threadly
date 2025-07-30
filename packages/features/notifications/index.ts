import { Knock } from '@knocklabs/node';
import { keys } from './keys';

const key = keys().KNOCK_SECRET_API_KEY;

export const notifications = new Knock(key);

// Email functionality (merged from @repo/email)
export * from './email/index';
export * from './email/service';
export * from './email/keys';
