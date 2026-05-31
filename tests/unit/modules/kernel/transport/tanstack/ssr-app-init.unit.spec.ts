import { describe, expect, it } from 'vitest';

import { createSsrAppHandlers } from '@/modules/kernel/transport/tanstack/ssr-app-init';

describe('createSsrAppHandlers', () => {
  it('keeps the public SSR init payload limited to localization state', () => {
    const payload = createSsrAppHandlers().init();

    expect(Object.keys(payload)).toEqual(['language']);
    expect(payload.language).toEqual(expect.any(String));
  });
});
