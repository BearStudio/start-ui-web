import { ZodString, z } from 'zod';

export const zu = {
  string: {
    nonEmpty(s: ZodString, message?: string) {
      return s.trim().min(1, message);
    },
    nonEmptyOptional(s: ZodString, message?: string) {
      return z
        .literal('')
        .transform(() => undefined)
        .or(zu.string.nonEmpty(s, message).optional());
    },
    email(s: ZodString, message?: string) {
      return s.trim().toLowerCase().email(message);
    },
    emailOptional(s: ZodString, message?: string) {
      return zu.string.nonEmptyOptional(zu.string.email(s, message), message);
    },
  },
} as const;
