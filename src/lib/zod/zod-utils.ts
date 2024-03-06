import { ZodString, z } from 'zod';

export const zu = {
  string: {
    nonEmpty(s: ZodString) {
      return s.trim().min(1);
    },
    nonEmptyOptional(s: ZodString) {
      return z
        .literal('')
        .transform(() => undefined)
        .or(zu.string.nonEmpty(s).optional());
    },
    email(s: ZodString) {
      return s.trim().toLowerCase().email();
    },
    emailOptional(s: ZodString) {
      return zu.string.nonEmptyOptional(zu.string.email(s));
    },
  },
} as const;
