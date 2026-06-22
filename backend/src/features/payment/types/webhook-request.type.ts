import { WebhookVerification } from './payment-provider.types';

export type WebhookRequest = {
  body: unknown;
  webhookVerification: WebhookVerification;
};
