import { vi } from 'vitest';

export const getCookie = vi.fn(() => undefined);

export const getRequestHeaders = vi.fn(() => new Headers());

export const setCookie = vi.fn((_name: string, _value: string) => undefined);

export const setResponseHeader = vi.fn(
  (_name: string, _value: string) => undefined
);
