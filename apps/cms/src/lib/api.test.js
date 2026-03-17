import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockResponse({ ok = true, status = 200, jsonData = {}, statusText = 'OK' } = {}) {
  return {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(jsonData),
  };
}

describe('cms api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
    window.location.hash = '#/dashboard';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.location.hash = '';
  });

  it('sends login requests to the auth endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        jsonData: { token: 'ok' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const { auth } = await import('./api.js');

    const result = await auth.login('hello@example.com', 'secret');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        email: 'hello@example.com',
        password: 'secret',
      }),
    });

    expect(result).toEqual({ token: 'ok' });
  });

  it('retries non-auth requests after a successful token refresh', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          jsonData: { message: 'expired' },
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          jsonData: { refreshed: true },
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          jsonData: [{ id: 1, title: 'Portfolio' }],
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const { projects } = await import('./api.js');

    const result = await projects.list();

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/projects', {
      method: 'GET',
      headers: {},
      credentials: 'same-origin',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/v1/admin/projects', {
      method: 'GET',
      headers: {},
      credentials: 'same-origin',
    });

    expect(result).toEqual([{ id: 1, title: 'Portfolio' }]);
  });

  it('redirects to login when refresh fails after a 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          jsonData: { message: 'expired' },
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          jsonData: { message: 'refresh failed' },
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const { projects, ApiError } = await import('./api.js');

    await expect(projects.list()).rejects.toMatchObject({
      status: 401,
      message: 'Session expired',
    });

    expect(window.location.hash).toBe('#/login');
    expect(ApiError).toBeDefined();
  });

  it('does not try token refresh for auth endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        jsonData: { message: 'bad credentials' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const { auth } = await import('./api.js');

    await expect(auth.login('hello@example.com', 'wrong')).rejects.toMatchObject({
      status: 401,
      message: 'bad credentials',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null for no-content responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: vi.fn(),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { auth } = await import('./api.js');

    const result = await auth.logout();

    expect(result).toBeNull();
  });

  it('surfaces api errors with status and message', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        jsonData: { message: 'database offline' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const { profile } = await import('./api.js');

    await expect(profile.get()).rejects.toMatchObject({
      status: 500,
      message: 'database offline',
    });
  });

  it('falls back to status text when error json cannot be parsed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { profile } = await import('./api.js');

    await expect(profile.get()).rejects.toMatchObject({
      status: 503,
      message: 'Service Unavailable',
    });
  });
});
