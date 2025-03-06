import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import planetsRouter from './routers/planets';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  planet: planetsRouter,
};
