"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Pencil } from "lucide-react";
import { useProject } from "@/lib/story-store";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";

export default function StoryDetailPage() {
  const params = useParams<{ id: string }>();
  const story = useProject(params.id);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  if (story === null) {
    return <p className="py-16 text-center text-sm text-muted" role="status">Loading story…</p>;
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          Story not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          It may have been removed or created on another device.
        </p>
        <Link href="/dashboard" className={buttonClass("secondary", "md", "mt-6")}>
          Back to projects
        </Link>
      </div>
    );
  }

  const Active = SLIDE_COMPONENTS[active].Component;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Story
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-balance text-foreground">
            {story.name}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted">{story.description}</p>
        </div>
        <div className="flex gap-3">
          {story.shareId ? (
            <Link href={`/s/${story.shareId}`} className={buttonClass("secondary", "md")}>
              View link
            </Link>
          ) : null}
          <Link href={`/story/new?edit=${story.id}`} className={buttonClass("secondary", "md")}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
          <Link href={`/story/${story.id}/export`} className={buttonClass("primary", "md")}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Share / Export
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          {SLIDE_COMPONENTS.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors duration-150 ease-out",
                active === i ? "bg-white text-black" : "hover:bg-surface",
              )}
            >
              <span className="font-display text-lg tracking-tight">{slide.label}</span>
              <span className="font-mono text-xs tabular-nums opacity-60">0{i + 1}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-border"
        >
          <SlidePreview>
            <Active story={story} />
          </SlidePreview>
        </motion.div>
      </div>
    </div>
  );
}
