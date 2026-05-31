import { describe, expect, it } from 'vitest';

import { getPageTitle } from '@/platform/lib/get-page-title';

describe('getPageTitle', () => {
  it('omits the prefix separator when no title prefix is provided', () => {
    expect(getPageTitle('Home')).toBe('Home | Start UI');
    expect(getPageTitle()).toBe('Start UI');
  });

  it('adds a separator when a title prefix is provided', () => {
    expect(getPageTitle('Home', '[Demo]')).toBe('[Demo] Home | Start UI');
    expect(getPageTitle(undefined, '[Demo]')).toBe('[Demo] Start UI');
  });
});
