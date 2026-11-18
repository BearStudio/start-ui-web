import { useState } from 'react';

// A filter added, or emptied from its editor, lives here while it has no value; once it has seen itself empty, a
// value takes over saying it is shown, so going back to a URL without it hides it. Waiting to have seen it empty
// matters when the value changes a render later than this state, as through a router.
type Entry = {
  readonly seenEmpty: boolean;
  /** Shown until a value arrives, which then shows it: its going later hides it. */
  readonly untilValue?: boolean;
};

export function useAddedFilters<Key extends string>(
  hasValue: (key: Key) => boolean
) {
  const [added, setAdded] = useState<ReadonlyMap<Key, Entry>>(new Map());
  const [open, setOpen] = useState<Key | null>(null);

  const next = new Map<Key, Entry>();
  let changed = false;
  for (const [key, entry] of added) {
    if (!hasValue(key)) {
      next.set(key, { ...entry, seenEmpty: true });
      changed ||= !entry.seenEmpty;
    } else if (entry.seenEmpty || entry.untilValue) changed = true;
    else next.set(key, entry);
  }
  if (changed) setAdded(next);
  // A filter that goes, on Back say, closes: Forward does not bring it back open.
  if (open !== null && !hasValue(open) && !next.has(open)) setOpen(null);

  const waitForEmpty = (key: Key) =>
    setAdded((keys) => new Map(keys).set(key, { seenEmpty: false }));

  return {
    isShown: (key: Key) => hasValue(key) || added.has(key),
    isOpen: (key: Key) => open === key,
    setOpen: (key: Key, isOpen: boolean) =>
      setOpen((current) => (isOpen ? key : current === key ? null : current)),
    // A filter that already holds a value is shown by it: opening it adds nothing to wait for.
    add: (key: Key) => {
      if (!hasValue(key)) waitForEmpty(key);
      setOpen(key);
    },
    /** Keeps the filter shown once its value is emptied, as a filter with no value yet. */
    keep: waitForEmpty,
    /** Undoes `keep` once a value follows the emptying: the value shows the filter, and its going hides it. */
    release: (key: Key) =>
      setAdded((keys) => {
        const entry = keys.get(key);
        return entry === undefined
          ? keys
          : new Map(keys).set(key, { ...entry, untilValue: true });
      }),
    clear: () => {
      setAdded(new Map());
      setOpen(null);
    },
    remove: (key: Key) => {
      setAdded((keys) => new Map([...keys].filter(([other]) => other !== key)));
      setOpen((current) => (current === key ? null : current));
    },
  };
}
