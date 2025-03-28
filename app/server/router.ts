import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import planetRouter from './routers/planet';
import repositoryRouter from './routers/repository';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  planet: planetRouter,
  repository: repositoryRouter,
  user: userRouter,
};
