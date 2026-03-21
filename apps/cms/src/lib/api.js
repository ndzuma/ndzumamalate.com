const BASE = '/api/v1';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: {},
    credentials: 'same-origin',
  };
  if (body !== null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);

  // Handle token refresh on 401
  if (res.status === 401 && !path.includes('/auth/')) {
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (refreshRes.ok) {
      // Retry original request
      const retry = await fetch(`${BASE}${path}`, opts);
      if (retry.status === 204) return null;
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ message: retry.statusText }));
        throw new ApiError(retry.status, err.message || retry.statusText);
      }
      return retry.json();
    }
    // Refresh failed — redirect to login
    window.location.hash = '#/login';
    throw new ApiError(401, 'Session expired');
  }

  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err.message || res.statusText);
  }
  return res.json();
}

// ── Auth ──
export const auth = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
  changePassword: (current_password, new_password) =>
    request('POST', '/auth/change-password', { current_password, new_password }),
  refresh: () => request('POST', '/auth/refresh'),
  activity: () => request('GET', '/auth/activity'),
};

// ── Admin CRUD ──
export const projects = {
  list: () => request('GET', '/admin/projects'),
  create: (data) => request('POST', '/admin/projects', data),
  update: (id, data) => request('PUT', `/admin/projects/${id}`, data),
  delete: (id) => request('DELETE', `/admin/projects/${id}`),
  reorder: (id, direction) => request('POST', `/admin/projects/${id}/reorder`, { direction }),
};

export const blogs = {
  list: () => request('GET', '/admin/blogs'),
  create: (data) => request('POST', '/admin/blogs', data),
  update: (id, data) => request('PUT', `/admin/blogs/${id}`, data),
  delete: (id) => request('DELETE', `/admin/blogs/${id}`),
};

export const tags = {
  list: () => request('GET', '/admin/tags'),
  create: (data) => request('POST', '/admin/tags', data),
  update: (id, data) => request('PUT', `/admin/tags/${id}`, data),
  delete: (id) => request('DELETE', `/admin/tags/${id}`),
};

export const skills = {
  list: () => request('GET', '/admin/skills'),
  create: (data) => request('POST', '/admin/skills', data),
  update: (id, data) => request('PUT', `/admin/skills/${id}`, data),
  delete: (id) => request('DELETE', `/admin/skills/${id}`),
};

export const experience = {
  list: () => request('GET', '/admin/experience'),
  create: (data) => request('POST', '/admin/experience', data),
  update: (id, data) => request('PUT', `/admin/experience/${id}`, data),
  delete: (id) => request('DELETE', `/admin/experience/${id}`),
};

export const cv = {
  list: () => request('GET', '/admin/cv'),
  create: (data) => request('POST', '/admin/cv', data),
  update: (id, data) => request('PUT', `/admin/cv/${id}`, data),
  delete: (id) => request('DELETE', `/admin/cv/${id}`),
};

export const profile = {
  get: () => request('GET', '/admin/profile'),
  update: (data) => request('PUT', '/admin/profile', data),
};

export const webhooks = {
  list: () => request('GET', '/admin/webhooks'),
  create: (data) => request('POST', '/admin/webhooks', data),
  update: (id, data) => request('PUT', `/admin/webhooks/${id}`, data),
  delete: (id) => request('DELETE', `/admin/webhooks/${id}`),
};

export { ApiError };

export const files = {
  upload: async (formData) => {
    const res = await fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    if (!res.ok) {
      if (res.status === 401) {
        // Handle token refresh logic here if needed or just fail
        throw new ApiError(401, 'Session expired');
      }
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, err.message || res.statusText);
    }
    return res.json();
  }
};
