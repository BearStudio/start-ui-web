import { z } from 'zod';

export type UserRole = z.infer<ReturnType<typeof zUserRole>>;
export const zUserRole = () => z.enum(['ROLE_ADMIN', 'ROLE_USER']);

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.number(),
    login: z.string(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    email: z.string(),
    activated: z.boolean(),
    langKey: z.string(),
    authorities: z.array(zUserRole()),
    createdBy: z.string().nullish(),
    createdDate: z.string().datetime().nullish(),
    lastModifiedBy: z.string().nullish(),
    lastModifiedDate: z.string().datetime().nullish(),
  });

export type UserList = z.infer<ReturnType<typeof zUserList>>;
export const zUserList = () =>
  z.object({
    content: z.array(zUser()),
    totalItems: z.string().transform(Number),
  });
