import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import {
  zEmailAddress,
  zSessionId,
  zUserId,
} from '@/modules/kernel/domain/ids';

export type User = z.infer<ReturnType<typeof zUser>>;
export const zRole = () => z.enum(['admin', 'user']);

export const zUser = () =>
  z.object({
    id: zUserId(),
    name: zu.fieldText.nullish(),
    email: zEmailAddress(),
    emailVerified: z.boolean(),
    role: zRole().nullish(),
    image: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    onboardedAt: z.date().nullish(),
  });

export type Session = z.infer<ReturnType<typeof zSession>>;
export const zSession = () =>
  z.object({
    id: zSessionId(),
    createdAt: z.date(),
    updatedAt: z.date(),
    expiresAt: z.date(),
    ipAddress: z.string().nullish(),
    userAgent: z.string().nullish(),
  });

export type FormFieldsUser = z.infer<ReturnType<typeof zFormFieldsUser>>;
export const zFormFieldsUser = () =>
  z.object({
    name: zu.fieldText.nullish(),
    email: zu.fieldText.required({ error: 'user:common.email.required' }).pipe(
      z.email({
        error: (issue) =>
          issue.input
            ? 'user:common.email.invalid'
            : 'user:common.email.required',
      })
    ),
    role: zRole().nullish(),
  });
