import { describe, expect, it } from 'vitest';

import {
  deriveOperationMetadataFromKey,
  hashTelemetryValue,
  stableStringify,
} from '@/platform/telemetry/metadata';

describe('telemetry metadata', () => {
  it('derives operation names from static query key segments', () => {
    const metadata = deriveOperationMetadataFromKey(
      ['book', 'v1', { scopeKey: 'scope-a' }, 'getAll', { searchTerm: 'dune' }],
      'query'
    );

    expect(metadata.operationName).toBe('book.getAll');
    expect(metadata.attributes).toMatchObject({
      'operation.key_dynamic_count': 2,
      'operation.name': 'book.getAll',
      'operation.type': 'query',
    });
    expect(metadata.attributes['operation.key_dynamic_hash']).toMatch(/^h/);
  });

  it('hides version segments from static operation labels', () => {
    const metadata = deriveOperationMetadataFromKey(
      ['fileUpload', 'v12', 'avatar'],
      'mutation'
    );

    expect(metadata.operationName).toBe('fileUpload.avatar');
    expect(metadata.attributes['operation.key_static']).toBe(
      'fileUpload.avatar'
    );
  });

  it('hashes dynamic values with stable object key ordering', () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(hashTelemetryValue({ b: 2, a: 1 })).toBe(
      hashTelemetryValue({ a: 1, b: 2 })
    );
  });
});
