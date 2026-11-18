// The theme: without it the components have no size, no focus ring, and no `sr-only`.
import i18next from 'i18next';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from 'vitest-browser-react';

import '@/styles/app.css';

// The browser's language may not be English: the tests read the English labels. `i18next` is the instance the app
// sets up, read here once a spec has imported it: importing the app's setup would load `react-i18next` before a spec
// mocks it.
beforeAll(async () => {
  if (i18next.isInitialized && i18next.language !== 'en')
    await i18next.changeLanguage('en');
});

// Base UI's scroll area measures itself after each render, outside `act`: React warns of it, though nothing is wrong.
const isKnownNoise = (args: ReadonlyArray<unknown>) => {
  const text = args.map(String).join(' ');
  return (
    text.includes('not wrapped in act(') && text.includes('ScrollAreaRoot')
  );
};

// Any other error fails the test that logged it.
let errors: Array<ReadonlyArray<unknown>> = [];

beforeEach(() => {
  errors = [];
  const original = console.error;
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    if (isKnownNoise(args)) return;
    errors.push(args);
    original(...args);
  });
});

afterEach(async () => {
  await cleanup();
  const found = errors;
  errors = [];
  vi.mocked(console.error).mockRestore();
  if (found.length > 0)
    throw new Error(
      `Unexpected console.error:\n${found.map((args) => args.map(String).join(' ')).join('\n')}`
    );
});
