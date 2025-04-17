import type { AxeMatchers } from 'vitest-axe/matchers';
import 'vitest';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
