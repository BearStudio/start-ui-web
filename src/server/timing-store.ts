import { AsyncLocalStorage } from 'async_hooks';

type QueryTiming = { model: string; operation: string; duration: number };

export const timingStore = new AsyncLocalStorage<{
  db: Array<QueryTiming>;
}>();
