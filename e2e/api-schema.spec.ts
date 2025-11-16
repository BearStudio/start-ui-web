import { expect, test } from 'e2e/utils';

test.describe('App Rest API Schema', () => {
  test(`App API schema is building without error`, async ({ request }) => {
    const response = await request.get('/api/openapi/app/schema');
    expect(response).toBeOK();
  });
});

test.describe('Auth Rest API Schema', () => {
  test(`Auth API schema is building without error`, async ({ request }) => {
    const response = await request.get('/api/openapi/auth/schema');
    expect(response).toBeOK();
  });
});
