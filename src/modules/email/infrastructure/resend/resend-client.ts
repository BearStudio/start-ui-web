import { Resend } from 'resend';

import { getEmailConfig } from '@/modules/kernel/infrastructure/config/email';

export function createResendClient(apiKey = getEmailConfig().resendApiKey) {
  return new Resend(apiKey);
}

let resend: ReturnType<typeof createResendClient> | undefined;

export function getDefaultResendClient() {
  resend ??= createResendClient();
  return resend;
}
