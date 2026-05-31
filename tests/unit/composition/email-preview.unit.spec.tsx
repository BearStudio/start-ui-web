import { describe, expect, it, vi } from 'vitest';

import { createEmailPreviewRequestHandler } from '@/composition/email-preview';

describe('email preview request handler', () => {
  it('hides the debug route when disabled', async () => {
    const preview = vi.fn();
    const handler = createEmailPreviewRequestHandler({
      enabled: false,
      preview,
    });

    const response = await handler(
      new Request('https://example.test/api/dev/email/login-code'),
      'login-code'
    );

    expect(response.status).toBe(404);
    expect(preview).not.toHaveBeenCalled();
  });

  it('parses query props and delegates preview rendering', async () => {
    const preview = vi.fn(async () => new Response('ok'));
    const handler = createEmailPreviewRequestHandler({
      enabled: true,
      preview,
    });

    const response = await handler(
      new Request(
        'https://example.test/api/dev/email/login-code?language=fr&code=123456'
      ),
      'login-code'
    );

    expect(response.status).toBe(200);
    expect(preview).toHaveBeenCalledWith('login-code', {
      language: 'fr',
      code: '123456',
    });
  });
});
