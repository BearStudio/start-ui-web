import { z } from 'zod';

import { publicProcedure } from '@/server/config/orpc';

const PlanetSchema = z.object({
  id: z.coerce.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

const listPlanet = publicProcedure
  .route({
    method: 'GET',
    path: '/planets',
  })
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(100).optional(),
        cursor: z.number().int().min(0).optional().default(0),
      })
      .default({})
  )
  .output(z.array(PlanetSchema))
  .handler(async ({ context }) => {
    // your list code here
    return [
      { id: 1, name: 'Earth' },
      { id: 2, name: 'Mars' },
      { id: 3, name: `User ${context.user?.id ?? 'unknown'}` },
    ];
  });

const findPlanet = publicProcedure
  .route({ method: 'GET', path: '/planets/{id}' })
  .input(z.object({ id: z.coerce.number().int().min(1) }))
  .output(PlanetSchema)
  .handler(async () => {
    // your find code here
    return { id: 1, name: 'Earth' };
  });

const createPlanet = publicProcedure
  .route({ method: 'POST', path: '/planets' })
  .input(PlanetSchema.omit({ id: true }))
  .output(PlanetSchema)
  .handler(async ({ input }) => {
    // your create code here
    // eslint-disable-next-line sonarjs/pseudo-random
    return { id: Math.floor(Math.random() * 9999), name: input.name };
  });

export default {
  list: listPlanet,
  find: findPlanet,
  create: createPlanet,
};
