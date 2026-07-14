"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Pencil } from "lucide-react";
import { getProject } from "@/lib/story-store";
import type { ProjectStory } from "@/lib/types";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { cn } from "@/lib/utils";

export default function StoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<ProjectStory | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setStory(getProject(params.id) ?? null);
  }, [params.id]);

  if (!story) {
    return (
      <div>
        <p className="text-muted">Story not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-foreground">
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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
            Story
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">
            {story.name}
          </h1>
          <p className="mt-2 text-muted">{story.description}</p>
        </div>
        <div className="flex gap-3">
          {story.shareId ? (
            <Link
              href={`/s/${story.shareId}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm"
            >
              View link
            </Link>
          ) : null}
          <Link
            href={`/story/new?repo=${story.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <Link
            href={`/story/${story.id}/export`}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
          >
            <Download className="h-4 w-4" />
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
              onClick={() => setActive(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition",
                active === i ? "bg-white !text-black" : "hover:bg-surface",
              )}
            >
              <span className="font-display text-lg tracking-tight">{slide.label}</span>
              <span className="font-mono text-xs opacity-60">0{i + 1}</span>
            </button>
          ))}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6 font-mono text-sm">
            <div>
              <div className="font-display text-2xl text-foreground">
                {story.carousel.features.length}
              </div>
              <div className="text-muted">Features</div>
            </div>
            <div>
              <div className="font-display text-2xl text-foreground">
                {story.carousel.engineering.length}
              </div>
              <div className="text-muted">Signals</div>
            </div>
            <div>
              <div className="font-display text-2xl text-foreground">{story.weeks || "—"}</div>
              <div className="text-muted">Weeks</div>
            </div>
          </div>
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
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
