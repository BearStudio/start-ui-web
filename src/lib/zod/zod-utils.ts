import { t } from 'i18next';
import { Schema, ZodArray, ZodString, z } from 'zod';

export const zu = {
  string: {
    nonEmpty(s: ZodString, message?: string) {
      return s
        .trim()
        .min(1, message ?? t('zod:errors.invalid_type_received_undefined'));
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
  array: {
    nonEmpty<T extends Schema>(a: ZodArray<T>, message?: string) {
      return a.min(
        1,
        message ?? t('zod:errors.invalid_type_received_undefined')
      );
    },
    nonEmptyOptional<T extends Schema>(a: ZodArray<T>, message?: string) {
      return a
        .transform((v) => (v.length === 0 ? undefined : v))
        .pipe(zu.array.nonEmpty(a, message).optional())
        .optional();
    },
  },
} as const;
