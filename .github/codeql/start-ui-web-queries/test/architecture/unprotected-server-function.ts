import { createServerFn } from '@tanstack/react-start';

export const unsafeMutation = createServerFn({ method: 'POST' }).handler(
  async ({ data }) => data
);

const runMutation = async (_data: unknown, fn: () => unknown) => fn();

export const safeMutation = createServerFn({ method: 'POST' }).handler(
  async ({ data }) => runMutation(data, () => data)
);

export const currentSession = createServerFn({ method: 'GET' }).handler(
  async () => null
);
