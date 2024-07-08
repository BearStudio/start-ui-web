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
    nonEmptyNullable(
      s: ZodString,
      options: {
        required_error?: string;
      } = {}
    ) {
      return z
        .literal('')
        .transform(() => null)
        .or(zu.string.nonEmpty(s, options).nullable());
    },
    nonEmptyNullish(
      s: ZodString,
      options: {
        required_error?: string;
      } = {}
    ) {
      return z
        .literal('')
        .transform(() => null)
        .or(zu.string.nonEmpty(s, options).nullish());
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
    emailNullable(
      s: ZodString,
      options: {
        required_error?: string;
        invalid_type_error?: string;
      } = {}
    ) {
      return zu.string.nonEmptyNullable(zu.string.email(s, options), options);
    },
    emailNullish(
      s: ZodString,
      options: {
        required_error?: string;
        invalid_type_error?: string;
      } = {}
    ) {
      return zu.string.nonEmptyNullish(zu.string.email(s, options), options);
    },
  },
  array: {
    nonEmpty<T extends Schema>(a: ZodArray<T>, message?: string) {
      return a.min(
        1,
        message ?? t('zod:errors.invalid_type_received_undefined')
      );
    },
    nonEmptyNullable<T extends Schema>(a: ZodArray<T>, message?: string) {
      return a
        .length(0)
        .transform(() => null)
        .or(zu.array.nonEmpty(a, message).nullable());
    },
    nonEmptyNullish<T extends Schema>(a: ZodArray<T>, message?: string) {
      return a
        .length(0)
        .transform(() => null)
        .or(zu.array.nonEmpty(a, message).nullish());
    },
  },
} as const;
