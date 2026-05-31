/// <reference types="@vitest/browser/providers/playwright" />

import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    pgliteTestDatabaseUrl: string;
  }
}
