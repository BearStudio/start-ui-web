import { describe, expect, it, vi } from 'vitest';

const i18nMock = vi.hoisted(() => {
  const t = vi.fn((key: string) => key);
  return {
    changeLanguage: vi.fn(),
    getFixedT: vi.fn(() => t),
    t,
  };
});

vi.mock('@/platform/lib/i18n', () => ({
  default: i18nMock,
}));

const loadTemplate = async () =>
  import('@/modules/email/presentation/templates/login-code');

describe('TemplateLoginCode', () => {
  it('uses a fixed translator instead of mutating global language state', async () => {
    const { TemplateLoginCode } = await loadTemplate();

    TemplateLoginCode({ language: 'fr', code: '123456' });

    expect(i18nMock.getFixedT).toHaveBeenCalledWith('fr', 'emails');
    expect(i18nMock.changeLanguage).not.toHaveBeenCalled();
  });
});
