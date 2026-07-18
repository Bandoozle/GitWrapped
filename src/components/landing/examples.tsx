"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EXAMPLE_STORIES } from "@/lib/preview-story";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function ExamplesSection() {
  const reduceMotion = useReducedMotion();
  const [projectIndex, setProjectIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const story = EXAMPLE_STORIES[projectIndex]!;
  const Slide = SLIDE_COMPONENTS[slideIndex]!.Component;

  useEffect(() => {
    setSlideIndex(0);
  }, [projectIndex]);

  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setTimeout(() => {
      setSlideIndex((i) => (i + 1) % SLIDE_COMPONENTS.length);
    }, 3200);
    return () => window.clearTimeout(t);
  }, [slideIndex, projectIndex, reduceMotion]);

  function prevSlide() {
    setSlideIndex((i) => (i - 1 + SLIDE_COMPONENTS.length) % SLIDE_COMPONENTS.length);
  }

  function nextSlide() {
    setSlideIndex((i) => (i + 1) % SLIDE_COMPONENTS.length);
  }

  return (
    <section id="examples" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-12">
        {/* Left — heading + project copy */}
        <div className="min-w-0 md:pr-2">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Examples</h2>
          <p className="mt-3 max-w-xl text-muted">
            Fake sample projects — flip through the same four-card format your repo would
            generate.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLE_STORIES.map((example, i) => {
              const active = i === projectIndex;
              return (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => setProjectIndex(i)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors duration-150",
                    active
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
                  )}
                >
                  {example.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
              Sample project
            </p>
            <h3 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              {story.name}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              {story.carousel.tagline}
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">Role</dt>
                <dd className="text-foreground">{story.carousel.role}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">Stack</dt>
                <dd className="text-foreground">{story.technologies.join(" · ")}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">Status</dt>
                <dd className="text-foreground">{story.carousel.statusLabel}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-2">
              {SLIDE_COMPONENTS.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSlideIndex(i)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs transition-colors duration-150",
                    i === slideIndex
                      ? "bg-accent text-accent-fg"
                      : "bg-surface-2 text-muted hover:text-foreground",
                  )}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — live card preview, top-aligned with Examples */}
        <div className="mx-auto w-full max-w-[340px] md:mx-0 md:ml-auto md:max-w-[380px]">
          <div className="overflow-hidden rounded-2xl border border-border shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${story.id}-${slideIndex}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
              >
                <SlidePreview>
                  <Slide story={story} />
                </SlidePreview>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevSlide}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-white/25 hover:text-foreground"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-mono text-[11px] tracking-wider text-muted">
              {String(slideIndex + 1).padStart(2, "0")} /{" "}
              {String(SLIDE_COMPONENTS.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={nextSlide}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-white/25 hover:text-foreground"
              aria-label="Next card"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
