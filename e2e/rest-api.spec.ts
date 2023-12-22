import { expect, test } from '@playwright/test';

test.describe('Rest Api Schema', () => {
  test(`Api schema is building without error`, async ({ request }) => {
    const response = await request.get('/api/openapi.json');
    expect(response).toBeOK();
  });
});
