import {
  InferRouterInputs,
  InferRouterOutputs,
  ORPCError,
  os,
} from '@orpc/server';
import type { IncomingHttpHeaders } from 'node:http';
import { z } from 'zod';

import { publicProcedure } from '@/server/config/orpc';

const PlanetSchema = z.object({
  id: z.coerce.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = publicProcedure
  .route({ method: 'GET', path: '/planets' })
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

export const findPlanet = os
  .route({ method: 'GET', path: '/planets/{id}' })
  .input(z.object({ id: z.coerce.number().int().min(1) }))
  .output(PlanetSchema)
  .handler(async () => {
    // your find code here
    return { id: 1, name: 'Earth' };
  });

export const createPlanet = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(({ next }) => {
    const user = { id: 1, name: 'Admin' };

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
    // eslint-disable-next-line sonarjs/pseudo-random
    return { id: Math.floor(Math.random() * 9999), name: input.name };
  });

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};
