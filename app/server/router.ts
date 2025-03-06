import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import authRouter from './routers/auth';
import planetRouter from './routers/planet';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  planet: planetRouter,
  auth: authRouter,
};
