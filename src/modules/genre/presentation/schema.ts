import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import { zGenreId } from '@/modules/kernel/domain/ids';

export type Genre = z.infer<ReturnType<typeof zGenre>>;

export const zGenre = () =>
  z.object({
    id: zGenreId(),
    name: zu.fieldText.required({ error: 'genre:common.name.required' }),
    color: z.string().length(7),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
