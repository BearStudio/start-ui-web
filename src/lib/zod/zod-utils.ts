import { t } from 'i18next';
import { z } from 'zod';

const emptyStringAsNull = (input: string) =>
  // Cast null value to string for React Hook Form inference
  input.trim() === '' ? (null as unknown as string) : input.trim();

const emptyStringAsUndefined = (input: string) =>
  // Cast undefined value to string for React Hook Form inference
  input.trim() === '' ? (undefined as unknown as string) : input.trim();

export const zu = {
  fieldText: {
    required: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) => z.string(params).transform(emptyStringAsNull).pipe(z.string(params)),
    nullable: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsNull)
        .nullable()
        .pipe(z.string(params).nullable()),
    nullish: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsNull)
        .nullish()
        .pipe(z.string(params).nullish()),
    optional: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsUndefined)
        .optional()
        .pipe(z.string(params).optional()),
  },
};
