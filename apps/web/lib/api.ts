import { Project, Blog, Skill, Experience, CV, Profile, Tag } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Error handling helper
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}/api/v1/public${endpoint}`;
  
  // Use ISR or standard dynamic caching. Revalidate every 60 seconds is a good default 
  // for a personal site so you don't hit your Go DB on every single visitor load, 
  // while still staying relatively fresh.
  const response = await fetch(url, {
    ...options,
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    return fetchAPI<Project[]>('/projects');
  },

  async getProjectBySlug(slug: string): Promise<Project> {
    return fetchAPI<Project>(`/projects/${slug}`);
  },

  // Blogs
  async getBlogs(): Promise<Blog[]> {
    return fetchAPI<Blog[]>('/blogs');
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    return fetchAPI<Blog>(`/blogs/${slug}`);
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    return fetchAPI<Skill[]>('/skills');
  },

  // Experience
  async getExperience(): Promise<Experience[]> {
    return fetchAPI<Experience[]>('/experience');
  },

  // CV
  async getActiveCV(): Promise<CV> {
    return fetchAPI<CV>('/cv/active');
  },

  // Profile
  async getProfile(): Promise<Profile> {
    return fetchAPI<Profile>('/profile');
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    return fetchAPI<Tag[]>('/tags');
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
      throw new Error(errData.error || 'Failed to submit contact form');
    }

    return response.json();
  },
};
