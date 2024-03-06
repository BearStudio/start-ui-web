import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Repository = z.infer<ReturnType<typeof zRepository>>;
export const zRepository = () =>
  z.object({
    id: z.string().cuid(),
    name: zu.string.nonEmpty(z.string()),
    link: zu.string.nonEmpty(z.string()),
    description: z.string().nullish(),
  });
