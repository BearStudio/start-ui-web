import { useState } from 'react';

import type {
  DataTableStateValue,
  DataTableStore,
} from '@/components/ui/data-table/state';

/** Keeps the state of a table in memory: it starts again from `initial` whenever the table mounts. */
export function useMemoryDataTableStore<S extends DataTableStateValue>(
  initial: S = {} as S
): DataTableStore<S> {
  const [state, setState] = useState(initial);
  return { state, update: (next) => setState(next) };
}
