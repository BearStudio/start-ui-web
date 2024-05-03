import { t } from 'i18next';
import { Schema, ZodArray, ZodString, z } from 'zod';

export const zu = {
  string: {
    nonEmpty(
      s: ZodString,
      options: {
        required_error?: string;
      } = {}
    ) {
      return s
        .trim()
        .min(
          1,
          options.required_error ??
            t('zod:errors.invalid_type_received_undefined')
        );
    },
    nonEmptyOptional(
      s: ZodString,
      options: {
        required_error?: string;
      } = {}
    ) {
      return z
        .literal('')
        .transform(() => undefined)
        .or(zu.string.nonEmpty(s, options).optional());
    },
    email(
      s: ZodString,
      options: {
        required_error?: string;
        invalid_type_error?: string;
      } = {}
    ) {
      return zu.string
        .nonEmpty(s.toLowerCase(), options)
        .email(options.invalid_type_error);
    },
    emailOptional(
      s: ZodString,
      options: {
        required_error?: string;
        invalid_type_error?: string;
      } = {}
    ) {
      return zu.string.nonEmptyOptional(zu.string.email(s, options), options);
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
