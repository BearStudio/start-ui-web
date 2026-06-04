import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerEntry: vi.fn((entry: unknown) => entry),
  handlerFetch: vi.fn(async () => new Response('ok')),
  wrapFetchWithSentry: vi.fn((entry: unknown) => entry),
}));

vi.mock('@sentry/tanstackstart-react', () => ({
  wrapFetchWithSentry: mocks.wrapFetchWithSentry,
}));

vi.mock('@tanstack/react-start/server-entry', () => ({
  default: {
    fetch: mocks.handlerFetch,
  },
  createServerEntry: mocks.createServerEntry,
}));

describe('server entry', () => {
  it('passes a request id through Start request context', async () => {
    const server = (await import('@/server')).default as {
      fetch: (request: Request) => Promise<Response>;
    };
    const request = new Request('https://app.example/');

    await server.fetch(request);

    expect(mocks.handlerFetch).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        context: {
          requestId: expect.any(String),
        },
      })
    );
  });
});
