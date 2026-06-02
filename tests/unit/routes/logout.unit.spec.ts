import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handleLogoutRequest: vi.fn(),
}));

vi.mock('@/modules/auth/backend', () => ({
  handleLogoutRequest: mocks.handleLogoutRequest,
}));

import {
  handleLogoutGetRequest,
  handleLogoutPostRequest,
} from '@/routes/logout';

describe('logout route handlers', () => {
  it('does not sign out on GET /logout', () => {
    const response = handleLogoutGetRequest();

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(mocks.handleLogoutRequest).not.toHaveBeenCalled();
  });

  it('signs out on POST /logout and preserves cookie clearing headers', async () => {
    const authHeaders = new Headers();
    authHeaders.append(
      'Set-Cookie',
      '__Host-session=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax'
    );
    mocks.handleLogoutRequest.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        headers: authHeaders,
        status: 200,
      })
    );

    const request = new Request('https://app.example/logout', {
      method: 'POST',
    });
    const response = await handleLogoutPostRequest(request);

    expect(mocks.handleLogoutRequest).toHaveBeenCalledWith(request);
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/');
    expect(response.headers.get('Set-Cookie')).toContain('__Host-session=');
    expect(response.headers.get('Set-Cookie')).toContain('Secure');
    expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    expect(response.headers.get('Set-Cookie')).toContain('SameSite=Lax');
  });
});
