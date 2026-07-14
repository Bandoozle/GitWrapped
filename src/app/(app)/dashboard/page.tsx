"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { loadProjects } from "@/lib/story-store";
import type { ProjectStory } from "@/lib/types";
import { cn, formatRelativeDay } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function actionLabel(status: ProjectStory["status"]) {
  if (status === "generated") return "View →";
  if (status === "ready") return "Generate →";
  return "Import →";
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectStory[] | null>(null);

  useEffect(() => {
    // Drop legacy seeded demo projects from v1 storage.
    window.localStorage.removeItem("code-story-projects-v1");
    setProjects(loadProjects());
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground">Projects</h1>
          <p className="mt-2 text-muted">Stories from your GitHub repositories.</p>
        </div>
        <Link
          href="/story/new"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New Story
        </Link>
      </div>

      {projects === null ? (
        <p className="mt-10 text-sm text-muted">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
          <h2 className="font-display text-2xl tracking-tight text-foreground">No stories yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Import a GitHub repository to generate your first carousel.
          </p>
          <Link
            href="/story/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
          >
            <Plus className="h-4 w-4" />
            New Story
          </Link>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-border">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease }}
            >
              <Link
                href={
                  project.status === "not_generated"
                    ? `/story/new?repo=${project.id}`
                    : `/story/${project.id}`
                }
                className="group flex items-center justify-between gap-6 py-6 transition-colors ease-apple hover:bg-surface/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl tracking-tight text-foreground group-hover:text-foreground">
                      {project.name}
                    </h2>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">{project.description}</p>
                  <p className="mt-2 font-mono text-xs text-muted/80">
                    {formatRelativeDay(project.updatedAt)}
                    {project.status === "generated"
                      ? ` · ${project.carousel?.features?.length ?? 0} features`
                      : null}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-medium transition",
                    project.status === "generated"
                      ? "text-foreground"
                      : "text-muted group-hover:text-foreground",
                  )}
                >
                  {actionLabel(project.status)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
