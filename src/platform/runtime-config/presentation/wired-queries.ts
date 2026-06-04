import { type ConfigQueryFacade, createConfigQueries } from './queries';
import { configEnv } from '../server';

export const configQueries = createConfigQueries({
  configEnv,
} satisfies ConfigQueryFacade);
