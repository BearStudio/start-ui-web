import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import assetRouter from './routers/asset';
import bookRouter from './routers/book';
import configRouter from './routers/config';
import genreRouter from './routers/genre';
import goodieRouter from './routers/goodie';
import ideaRouter from './routers/idea';
import supplierRouter from './routers/suppliers';
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
  asset: assetRouter,
  goodie: goodieRouter,
  idea: ideaRouter,
  supplier: supplierRouter,
};
