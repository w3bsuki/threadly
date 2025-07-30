import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { keys } from './keys';

const env = keys();
const stripeKey = env.STRIPE_SECRET_KEY || '';

export const paymentsAgentToolkit = new StripeAgentToolkit({
  secretKey: stripeKey,
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
      products: {
        create: true,
      },
      prices: {
        create: true,
      },
    },
  },
});
