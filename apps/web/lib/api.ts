import { Project, Blog, Skill, Experience, CV, Profile, Tag, F1WidgetData, SpaceLaunch, PageContent } from '../types/api';
import { cached } from './cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Raw request against the public API. Retries transient failures (network
 * errors, 5xx) so a briefly-restarting API doesn't poison a render, and never
 * turns a failure into an empty success.
 */
async function requestAPI<T>(endpoint: string, init: RequestInit = {}, attempts = 3): Promise<T> {
  const url = `${API_URL}/api/v1/public${endpoint}`;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, { cache: 'no-store', ...init });
      if (response.ok) {
        return response.json();
      }
      const error = new ApiError(response.status, `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      if (response.status < 500) throw error;
      lastError = error;
    } catch (error) {
      if (error instanceof ApiError && error.status < 500) throw error;
      lastError = error;
    }
    if (attempt < attempts - 1) await sleep(250 * 2 ** attempt);
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${endpoint}`);
}

/** Server-side read that goes through the content cache. */
function read<T>(endpoint: string): Promise<T> {
  return cached<T>(endpoint, () => requestAPI<T>(endpoint));
}

export const api = {
  // Projects
  getProjects(): Promise<Project[]> {
    return read<Project[]>('/projects');
  },

  getProjectBySlug(slug: string): Promise<Project> {
    return read<Project>(`/projects/${encodeURIComponent(slug)}`);
  },

  // Writings (the API still calls them blogs)
  getBlogs(): Promise<Blog[]> {
    return read<Blog[]>('/blogs');
  },

  getBlogBySlug(slug: string): Promise<Blog> {
    return read<Blog>(`/blogs/${encodeURIComponent(slug)}`);
  },

  // Skills
  getSkills(): Promise<Skill[]> {
    return read<Skill[]>('/skills');
  },

  // Experience
  getExperience(): Promise<Experience[]> {
    return read<Experience[]>('/experience');
  },

  // CV
  getActiveCV(): Promise<CV> {
    return read<CV>('/cv/active');
  },

  // Profile
  getProfile(): Promise<Profile> {
    return read<Profile>('/profile');
  },

  // Tags
  getTags(): Promise<Tag[]> {
    return read<Tag[]>('/tags');
  },

  // Editable page content
  getPage(key: string): Promise<PageContent> {
    return read<PageContent>(`/pages/${encodeURIComponent(key)}`);
  },

  // F1 Data (client-side, cached by the API in Redis)
  getF1Data(): Promise<F1WidgetData> {
    return requestAPI<F1WidgetData>('/f1', {}, 1);
  },

  // Space Data (client-side, cached by the API in Redis)
  getSpaceData(): Promise<SpaceLaunch> {
    return requestAPI<SpaceLaunch>('/space', {}, 1);
  },

  // Contact
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    const url = `${API_URL}/api/v1/public/contact`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'Failed to submit contact form');
    }

    return response.json();
  },
};

/**
 * Warm every list endpoint the site renders from. Called by the sync layer right
 * after invalidation so the next render (and the client refresh) is instant.
 */
export async function warmContentCache(): Promise<void> {
  const reads: Promise<unknown>[] = [
    api.getProjects(),
    api.getBlogs(),
    api.getSkills(),
    api.getExperience(),
    api.getTags(),
    api.getProfile(),
    api.getActiveCV(),
    ...['home', 'stack', 'projects', 'writings', 'experience'].map((key) => api.getPage(key)),
  ];
  await Promise.allSettled(reads);
}
