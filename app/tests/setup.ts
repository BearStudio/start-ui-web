import { cleanup } from '@testing-library/react';
import ResizeObserver from 'resize-observer-polyfill';
import { afterEach, vi } from 'vitest';
import { expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import '@/lib/dayjs/config';
import 'vitest-axe/extend-expect';

expect.extend(matchers);

afterEach(cleanup);

global.ResizeObserver = ResizeObserver;

Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: vi.fn().mockImplementation(() => null),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
