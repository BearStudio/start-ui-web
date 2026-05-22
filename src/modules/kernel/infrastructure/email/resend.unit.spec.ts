import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  env: {
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'Start UI <noreply@example.com>',
    EMAIL_DELIVERY_DISABLED: false,
    VITE_IS_DEMO: false,
  },
  resendConstructor: vi.fn(),
  send: vi.fn(),
}));

vi.mock('@/modules/kernel/infrastructure/config/env', () => ({
  env: testState.env,
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend(apiKey: string) {
    testState.resendConstructor(apiKey);
    return {
      emails: {
        send: testState.send,
      },
    };
  }),
}));

const loadSendEmail = async () => {
  vi.resetModules();
  return import('./resend');
};

describe('Resend email adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(testState.env, {
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'Start UI <noreply@example.com>',
      EMAIL_DELIVERY_DISABLED: false,
      VITE_IS_DEMO: false,
    });
    testState.send.mockResolvedValue({
      data: { id: 'email_123' },
      error: null,
      headers: null,
    });
  });

  it('skips sending in demo mode', async () => {
    testState.env.VITE_IS_DEMO = true;
    const { sendEmail } = await loadSendEmail();

    await sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
    });

    expect(testState.send).not.toHaveBeenCalled();
  });

  it('skips sending when delivery is disabled', async () => {
    testState.env.EMAIL_DELIVERY_DISABLED = true;
    const { sendEmail } = await loadSendEmail();

    await sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
    });

    expect(testState.send).not.toHaveBeenCalled();
  });

  it('sends React email templates through Resend', async () => {
    const template = createElement('div', null, '123456');
    const { sendEmail } = await loadSendEmail();

    await expect(
      sendEmail({
        to: 'user@example.com',
        subject: 'Login code',
        template,
      })
    ).resolves.toEqual({ id: 'email_123' });

    expect(testState.resendConstructor).toHaveBeenCalledWith('re_test');
    expect(testState.send).toHaveBeenCalledWith({
      from: 'Start UI <noreply@example.com>',
      to: 'user@example.com',
      subject: 'Login code',
      react: template,
    });
  });

  it('throws an AppError when Resend returns an error', async () => {
    testState.send.mockResolvedValue({
      data: null,
      error: {
        message: 'Invalid API key',
        name: 'invalid_api_key',
        statusCode: 401,
      },
      headers: null,
    });
    const { sendEmail } = await loadSendEmail();

    await expect(
      sendEmail({
        to: 'user@example.com',
        subject: 'Login code',
        template: createElement('div', null, '123456'),
      })
    ).rejects.toMatchObject({
      code: 'EMAIL_SEND_FAILED',
      category: 'system',
      status: 401,
      message: 'Failed to send email',
      details: {
        provider: 'resend',
        errorName: 'invalid_api_key',
        statusCode: 401,
      },
    });
  });
});
