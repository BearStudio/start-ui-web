import { AsyncLocalStorage } from 'async_hooks';

type PrismaTiming = { model: string; operation: string; duration: number };

export const timingStore = new AsyncLocalStorage<{
  prisma: Array<PrismaTiming>;
}>();
