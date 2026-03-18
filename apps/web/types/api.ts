export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_url?: string;
  live_url?: string;
  repo_url?: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image_url?: string;
  published: boolean;
  published_at?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SkillCategory =
  | 'programming_language'
  | 'framework'
  | 'database'
  | 'tool'
  | 'soft_skill'
  | 'other';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon_url?: string;
  proficiency: number;
  sort_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CV {
  id: string;
  file_url: string;
  label?: string;
  is_active: boolean;
  uploaded_at: string;
}

export interface Profile {
  id: number;
  open_to_work: boolean;
  spotify_url?: string;
  apple_music_url?: string;
  currently_reading_title?: string;
  currently_reading_url?: string;
  github_url?: string;
  twitter_url?: string;
  threads_url?: string;
  linkedin_url?: string;
  website_url?: string;
  updated_at: string;
}
