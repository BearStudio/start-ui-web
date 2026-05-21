import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { UserId } from '@/modules/kernel/domain/ids';

export type RequestContext = {
  requestId: string;
  userId?: UserId;
  logger: Logger;
};

export function createRequestContext(input: RequestContext): RequestContext {
  return input;
}
