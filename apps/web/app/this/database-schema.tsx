import { Database } from "@phosphor-icons/react/dist/ssr";
import React from "react";

export function SchemaTable({ name, children }: { name: string, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm font-mono text-xs flex flex-col justify-start h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 text-black font-semibold">
        <Database className="w-4 h-4 text-black/40" /> {name}
      </div>
      <div className="flex flex-col gap-1.5 text-black/60">
        {children}
      </div>
    </div>
  );
}

export function SchemaRow({ name, type }: { name: string, type: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-black/80">{name}</span>
      <span className="text-[10px] text-black/40">{type}</span>
    </div>
  );
}

export function DatabaseSchemaGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SchemaTable name="projects">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="title" type="TEXT" />
        <SchemaRow name="slug" type="TEXT (UNIQUE)" />
        <SchemaRow name="summary" type="TEXT" />
        <SchemaRow name="content" type="TEXT" />
        <SchemaRow name="image_url" type="TEXT" />
        <SchemaRow name="live_url" type="TEXT" />
        <SchemaRow name="repo_url" type="TEXT" />
        <SchemaRow name="featured" type="BOOLEAN" />
        <SchemaRow name="published" type="BOOLEAN" />
        <SchemaRow name="sort_order" type="INT" />
        <SchemaRow name="start_date" type="TIMESTAMPTZ" />
        <SchemaRow name="end_date" type="TIMESTAMPTZ" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="experience">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="company" type="TEXT" />
        <SchemaRow name="role" type="TEXT" />
        <SchemaRow name="type" type="TEXT" />
        <SchemaRow name="location" type="TEXT" />
        <SchemaRow name="description" type="TEXT" />
        <SchemaRow name="start_date" type="DATE" />
        <SchemaRow name="end_date" type="DATE" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="blogs">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="title" type="TEXT" />
        <SchemaRow name="slug" type="TEXT (UNIQUE)" />
        <SchemaRow name="summary" type="TEXT" />
        <SchemaRow name="content" type="TEXT" />
        <SchemaRow name="cover_image_url" type="TEXT" />
        <SchemaRow name="published" type="BOOLEAN" />
        <SchemaRow name="published_at" type="TIMESTAMPTZ" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="skills">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="name" type="TEXT" />
        <SchemaRow name="category" type="ENUM" />
        <SchemaRow name="icon_url" type="TEXT" />
        <SchemaRow name="proficiency" type="SMALLINT" />
        <SchemaRow name="sort_order" type="INT" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="profile">
        <SchemaRow name="id" type="INT (PK)" />
        <SchemaRow name="open_to_work" type="BOOLEAN" />
        <SchemaRow name="spotify_url" type="TEXT" />
        <SchemaRow name="apple_music_url" type="TEXT" />
        <SchemaRow name="currently_reading_title" type="TEXT" />
        <SchemaRow name="currently_reading_url" type="TEXT" />
        <SchemaRow name="github_url" type="TEXT" />
        <SchemaRow name="twitter_url" type="TEXT" />
        <SchemaRow name="linkedin_url" type="TEXT" />
        <SchemaRow name="website_url" type="TEXT" />
        <SchemaRow name="threads_url" type="TEXT" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="tags">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="name" type="TEXT (UNIQUE)" />
        <SchemaRow name="slug" type="TEXT (UNIQUE)" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="admin_users">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="email" type="TEXT (UNIQUE)" />
        <SchemaRow name="password_hash" type="TEXT" />
        <SchemaRow name="last_login_at" type="TIMESTAMPTZ" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="login_events">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="user_id" type="UUID (FK)" />
        <SchemaRow name="is_active" type="BOOLEAN" />
        <SchemaRow name="ip_address" type="TEXT" />
        <SchemaRow name="user_agent" type="TEXT" />
        <SchemaRow name="last_seen_at" type="TIMESTAMPTZ" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="cv">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="file_url" type="TEXT" />
        <SchemaRow name="label" type="TEXT" />
        <SchemaRow name="is_active" type="BOOLEAN (UNIQUE)" />
        <SchemaRow name="uploaded_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="webhook_endpoints">
        <SchemaRow name="id" type="UUID (PK)" />
        <SchemaRow name="url" type="TEXT (UNIQUE)" />
        <SchemaRow name="secret" type="TEXT" />
        <SchemaRow name="is_active" type="BOOLEAN" />
        <SchemaRow name="created_at" type="TIMESTAMPTZ" />
        <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
      </SchemaTable>

      <SchemaTable name="project_tags">
        <SchemaRow name="project_id" type="UUID (FK)" />
        <SchemaRow name="tag_id" type="UUID (FK)" />
        <div className="pt-2 mt-1 border-t border-black/5 text-[10px] text-black/40 text-center">Composite PK</div>
      </SchemaTable>

      <SchemaTable name="blog_tags">
        <SchemaRow name="blog_id" type="UUID (FK)" />
        <SchemaRow name="tag_id" type="UUID (FK)" />
        <div className="pt-2 mt-1 border-t border-black/5 text-[10px] text-black/40 text-center">Composite PK</div>
      </SchemaTable>
    </div>
  );
}
