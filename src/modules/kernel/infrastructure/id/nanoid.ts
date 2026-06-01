import { createId } from '@paralleldrive/cuid2';

import type { IdGenerator } from '@/modules/kernel/application/ports/id-generator';
import { toGeneratedId } from '@/modules/kernel/domain/ids';

export const cuidIdGenerator: IdGenerator = {
  createId: () => toGeneratedId(createId()),
};
