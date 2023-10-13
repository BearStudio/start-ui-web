import { z } from 'zod';

import { zUser } from '@/features/users/schemas';

export type UserAccount = z.infer<ReturnType<typeof zUserAccount>>;
export const zUserAccount = () =>
  zUser().pick({
    id: true,
    name: true,
    email: true,
    authorizations: true,
    language: true,
  });
