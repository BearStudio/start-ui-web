import { AsyncLocalStorage } from 'async_hooks';

type DbTiming = { model: string; operation: string; duration: number };

export const timingStore = new AsyncLocalStorage<{
  db: Array<DbTiming>;
}>();
