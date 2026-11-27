import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

import { readColorScheme } from './color-scheme';

export const getColorScheme = createIsomorphicFn()
  .server(() => readColorScheme(getRequestHeader('cookie')))
  .client(() => readColorScheme());
