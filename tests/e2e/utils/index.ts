import { test as base } from '@playwright/test';
import { ExtendedPage, pageWithUtils } from '@tests/e2e/utils/page';

const test = base.extend<ExtendedPage>({
  page: pageWithUtils,
});

export * from '@playwright/test';
export { test };
