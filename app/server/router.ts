import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import planetRouter from './routers/planet';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  planet: planetRouter,
};
