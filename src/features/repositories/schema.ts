import { z } from 'zod';

export type Repository = z.infer<ReturnType<typeof zRepository>>;
export const zRepository = () =>
  z.object({
    id: z.number(),
    name: z.string(),
    link: z.string(),
    description: z.string().nullish(),
  });

export type RepositoryList = z.infer<ReturnType<typeof zRepositoryList>>;
export const zRepositoryList = () =>
  z.object({
    repositories: z.array(zRepository()),
    totalItems: z.string().transform(Number),
  });
