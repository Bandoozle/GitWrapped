"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { useProjects } from "@/lib/story-store";
import type { ProjectStory } from "@/lib/types";
import { cn, formatRelativeDay } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

function actionLabel(status: ProjectStory["status"]) {
  if (status === "generated") return "View";
  if (status === "ready") return "Generate";
  return "Import";
}

export default function DashboardPage() {
  const projects = useProjects();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Drop legacy seeded demo projects from v1 storage.
    window.localStorage.removeItem("code-story-projects-v1");
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-balance text-foreground sm:text-5xl">
            Projects
          </h1>
          <p className="mt-2 text-muted">Stories from your GitHub repositories.</p>
        </div>
        <Link href="/story/new" className={buttonClass("primary", "md")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Story
        </Link>
      </div>

      {projects === null ? (
        <ul className="mt-10 divide-y divide-border border-y border-border" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-6 py-6">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-6 w-40 animate-pulse rounded-md bg-surface-2" />
                <div className="h-4 w-64 animate-pulse rounded-md bg-surface" />
                <div className="h-3 w-32 animate-pulse rounded-md bg-surface" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded-md bg-surface" />
            </li>
          ))}
        </ul>
      ) : projects.length === 0 ? (
        <div className="mt-14 border-y border-border py-16 text-center">
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            No stories yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">
            Import a GitHub repository to generate your first carousel.
          </p>
          <Link href="/story/new" className={buttonClass("primary", "md", "mt-6")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Story
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {projects.map((project, i) => (
            <motion.li
              key={project.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease }}
            >
              <Link
                href={
                  project.status === "not_generated"
                    ? `/story/new?repo=${project.id}`
                    : `/story/${project.id}`
                }
                className="group flex items-center justify-between gap-6 py-6 transition-colors duration-150 ease-out"
              >
                <div className="min-w-0">
                  <h2 className="font-display text-2xl tracking-tight text-foreground transition-colors group-hover:text-accent">
                    {project.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-muted">{project.description}</p>
                  <p className="mt-2 font-mono text-xs tabular-nums text-muted/80">
                    {formatRelativeDay(project.updatedAt)}
                    {project.status === "generated"
                      ? ` · ${project.carousel?.features?.length ?? 0} capabilities`
                      : null}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors duration-150 ease-out",
                    project.status === "generated"
                      ? "text-foreground group-hover:text-accent"
                      : "text-muted group-hover:text-accent",
                  )}
                >
                  {actionLabel(project.status)}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
