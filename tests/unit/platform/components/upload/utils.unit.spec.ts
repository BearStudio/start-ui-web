import { describe, expect, it } from 'vitest';

import { fileUploadMutationKey } from '@/platform/components/upload/utils';

describe('upload mutation keys', () => {
  it('uses a versioned file upload mutation key', () => {
    expect(fileUploadMutationKey('avatar')).toEqual([
      'fileUpload',
      'v1',
      'avatar',
    ]);
  });
});
