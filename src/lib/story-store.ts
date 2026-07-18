"use client";

import { useSyncExternalStore } from "react";
import type { ProjectStory } from "./types";
import { normalizeCarousel } from "./types";

const STORAGE_KEY = "gitwrapped-projects-v3";

const EMPTY: ProjectStory[] = [];

/** Cached snapshot so `getSnapshot` returns a stable reference between reads. */
let cachedRaw: string | null = null;
let cachedProjects: ProjectStory[] = EMPTY;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function normalizeProject(project: ProjectStory): ProjectStory {
  return {
    ...project,
    carousel: normalizeCarousel(project.carousel, {
      activityStatus: project.activityStatus,
      contributors: project.contributors,
      homepage: project.homepage,
    }),
  };
}

export function loadProjects(): ProjectStory[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedProjects;
    cachedRaw = raw;
    const parsed = raw ? (JSON.parse(raw) as ProjectStory[]) : EMPTY;
    cachedProjects = parsed.map(normalizeProject);
    return cachedProjects;
  } catch {
    cachedRaw = null;
    cachedProjects = EMPTY;
    return EMPTY;
  }
}

export function saveProjects(projects: ProjectStory[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  cachedRaw = null; // force re-parse on next read
  notify();
}

export function upsertProject(project: ProjectStory) {
  const projects = [...loadProjects()];
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
  cachedRaw = null;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedRaw = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Subscribe to the localStorage-backed project list without a mount effect.
 * `null` on the server / first client render keeps SSR output and hydration in
 * sync; the real list arrives once the client reads localStorage.
 */
export function useProjects(): ProjectStory[] | null {
  return useSyncExternalStore(
    subscribe,
    () => loadProjects(),
    () => null,
  );
}

export function useProject(id: string): ProjectStory | null | undefined {
  const projects = useProjects();
  if (projects === null) return null;
  return projects.find((p) => p.id === id);
}
