import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Genre = z.infer<ReturnType<typeof zGenre>>;

export const zGenre = () =>
  z.object({
    id: z.string().cuid(),
    name: zu.string.nonEmpty(z.string(), {
      required_error: t('genre:common.name.required'),
    }),
    color: z.string().length(7),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
