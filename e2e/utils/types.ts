import type {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  TestFixture,
} from '@playwright/test';
import type { ExtendedPage } from 'e2e/utils/page';

export type CustomFixture<TReturn> = TestFixture<
  TReturn,
  PlaywrightTestArgs & PlaywrightTestOptions & ExtendedPage
>;
