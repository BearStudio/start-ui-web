import { vi } from 'vitest';

export const getRequestHeaders = vi.fn(() => new Headers());

export const setResponseHeader = vi.fn(
  (_name: string, _value: string) => undefined
);
