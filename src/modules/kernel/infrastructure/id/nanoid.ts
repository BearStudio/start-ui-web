import { createId } from '@paralleldrive/cuid2';

import type { IdGenerator } from '@/modules/kernel/application/ports/id-generator';

export const cuidIdGenerator: IdGenerator = {
  createId: createId,
};
