import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

import { readColorScheme } from './color-scheme';

// Not exported from the index: the `@tanstack/react-start/server` import only
// builds under TanStack Start, not in Vitest or Storybook.

export const getColorScheme = createIsomorphicFn()
  .server(() => readColorScheme(getRequestHeader('cookie')))
  .client(() => readColorScheme());
