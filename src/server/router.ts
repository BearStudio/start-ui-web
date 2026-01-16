import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import aiRouter from './routers/ai';
import bookRouter from './routers/book';
import configRouter from './routers/config';
import genreRouter from './routers/genre';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  account: accountRouter,
  book: bookRouter,
  genre: genreRouter,
  user: userRouter,
  config: configRouter,
  ai: aiRouter,
};
