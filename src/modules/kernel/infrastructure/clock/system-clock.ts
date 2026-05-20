import type { Clock } from '@/modules/kernel/application/ports/clock';

export const systemClock: Clock = {
  now: () => new Date(),
};
