import { describe, expect, it } from 'vitest';

import { cn } from '@/platform/lib/tailwind/utils';

describe('cn', () => {
  it('combines conditional class values and resolves tailwind conflicts', () => {
    const isHidden = false;

    expect(
      cn(
        'px-2 text-sm text-muted-foreground',
        isHidden && 'hidden',
        ['py-1', 'px-4'],
        { 'font-medium': true, 'opacity-50': false },
        'text-foreground'
      )
    ).toBe('text-sm py-1 px-4 font-medium text-foreground');
  });
});
