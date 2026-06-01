import type { GeneratedId } from '../../domain/ids';

export interface IdGenerator {
  createId(): GeneratedId;
}
