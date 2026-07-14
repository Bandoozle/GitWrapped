"use client";

import type { ProjectStory } from "./types";

const STORAGE_KEY = "gitwrapped-projects-v3";

export function loadProjects(): ProjectStory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProjectStory[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: ProjectStory[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertProject(project: ProjectStory) {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) projects[index] = project;
  else projects.unshift(project);
  saveProjects(projects);
  return projects;
}

export function getProject(id: string): ProjectStory | undefined {
  return loadProjects().find((p) => p.id === id);
}

export function clearProjects() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("code-story-projects-v2");
  window.localStorage.removeItem("code-story-projects-v1");
}
