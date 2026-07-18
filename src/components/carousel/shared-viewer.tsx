"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { ProjectStory } from "@/lib/types";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";

export function SharedCarouselViewer({ story }: { story: ProjectStory }) {
  const [index, setIndex] = useState(0);
  const Active = SLIDE_COMPONENTS[index].Component;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(SLIDE_COMPONENTS.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
            GitWrapped
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-balance text-foreground sm:text-4xl">
            {story.name}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted">{story.description}</p>
        </div>
        <a
          href={story.carousel.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm transition-colors duration-150 ease-out hover:border-white/25 hover:bg-surface-2 active:scale-[0.97]"
        >
          GitHub
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Carousel slides"
      >
        {SLIDE_COMPONENTS.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === i}
            onClick={() => setIndex(i)}
            className={`rounded-md px-3 py-1.5 text-xs whitespace-nowrap tabular-nums transition-colors duration-150 ease-out ${
              index === i
                ? "bg-white text-black"
                : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {i + 1}. {slide.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(10,16,22,0.45)] ring-1 ring-border"
        >
          <SlidePreview>
            <Active story={story} />
          </SlidePreview>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Prev
        </button>
        <div className="flex items-center gap-1.5">
          {SLIDE_COMPONENTS.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to ${slide.label}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="group grid h-6 w-8 place-items-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-200 ease-out ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-4 bg-surface-2 group-hover:bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(SLIDE_COMPONENTS.length - 1, i + 1))}
          disabled={index === SLIDE_COMPONENTS.length - 1}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
