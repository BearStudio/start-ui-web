import { z } from 'zod';

export type Repository = z.infer<ReturnType<typeof zRepository>>;
export const zRepository = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    link: z.string(),
    description: z.string().nullish(),
  });
