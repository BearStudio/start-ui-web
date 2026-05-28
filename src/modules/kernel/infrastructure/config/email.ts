import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
  zNonEmptyEnvString,
} from './env-schema';

const emailEnvSchema = baseEnvSchema
  .extend({
    RESEND_API_KEY: zNonEmptyEnvString(),
    RESEND_WEBHOOK_SECRET: z.string().trim().optional(),
    EMAIL_FROM: zNonEmptyEnvString(),
    EMAIL_DELIVERY_DISABLED: z.stringbool().default(false),
  })
  .superRefine((env, ctx) => {
    if (isProdRuntimeEnvironment(env) && env.RESEND_API_KEY === 'REPLACE ME') {
      ctx.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'Update RESEND_API_KEY for production',
      });
    }
  });

export type EmailConfig = {
  resendApiKey: string;
  resendWebhookSecret?: string;
  from: string;
  deliveryDisabled: boolean;
};

let cachedEmailConfig: EmailConfig | undefined;

export function getEmailConfig(): EmailConfig {
  if (cachedEmailConfig) return cachedEmailConfig;

  const env = parseEnv(emailEnvSchema);
  cachedEmailConfig = {
    resendApiKey: env.RESEND_API_KEY,
    resendWebhookSecret: env.RESEND_WEBHOOK_SECRET,
    from: env.EMAIL_FROM,
    deliveryDisabled: env.EMAIL_DELIVERY_DISABLED,
  };
  return cachedEmailConfig;
}
