import { ORPCError, os } from '@orpc/server';
import type { IncomingHttpHeaders } from 'node:http';
import { z } from 'zod';

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = os
  .route({ method: 'GET', path: '/planets' })
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).optional().default(0),
    })
  )
  .output(z.array(PlanetSchema))
  .handler(async () => {
    // your list code here
    return [{ id: 1, name: 'name' }];
  });

export const findPlanet = os
  .route({ method: 'GET', path: '/planets/{id}' })
  .input(z.object({ id: z.coerce.number().int().min(1) }))
  .output(PlanetSchema)
  .handler(async () => {
    // your find code here
    return { id: 1, name: 'name' };
  });

export const createPlanet = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(({ next }) => {
    const user = { id: 1, name: 'test' };

    if (user) {
      return next({ context: { user } });
    }

    throw new ORPCError('UNAUTHORIZED');
  })
  .route({ method: 'POST', path: '/planets' })
  .input(PlanetSchema.omit({ id: true }))
  .output(PlanetSchema)
  .handler(async ({ input }) => {
    // your create code here
    return { id: 1, name: input.name };
  });

export type Router = typeof router;
export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};
