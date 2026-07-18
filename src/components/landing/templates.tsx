"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TEMPLATES, type TemplateId } from "@/lib/types";
import { EXAMPLE_STORY } from "@/lib/preview-story";
import { ProjectSlide } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TemplatesSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-template-card]")];
    if (!cards.length) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActive();
    el.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    return () => {
      el.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, [syncActive]);

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-template-card]")[index];
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <section id="templates" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Templates</h2>
            <p className="mt-3 max-w-xl text-muted">
              Three looks for the same four-card story. Pick one when you generate — swap anytime.
            </p>
          </div>
          <Link
            href="/login"
            className={buttonClass(
              "secondary",
              "md",
              "shrink-0 rounded-full self-start sm:self-auto",
            )}
          >
            Start with a template
          </Link>
        </div>

        {/* Mobile: horizontal swipe */}
        <div className="mt-10 sm:hidden">
          <div
            ref={scrollerRef}
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Template previews"
          >
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                tagline={template.tagline}
                className="w-[min(100%,320px)] shrink-0 snap-center"
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Templates">
            {TEMPLATES.map((template, i) => (
              <button
                key={template.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show ${template.name} template`}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-200",
                  i === active ? "w-6 bg-accent" : "w-2 bg-white/25 hover:bg-white/40",
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-center font-display text-lg tracking-tight">
            {TEMPLATES[active]?.name}
          </p>
          <p className="mt-1 text-center text-sm text-muted">{TEMPLATES[active]?.tagline}</p>
        </div>

        {/* Desktop: three-up grid */}
        <div className="mt-10 hidden gap-6 sm:grid sm:grid-cols-3">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              tagline={template.tagline}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  id,
  name,
  tagline,
  className,
}: {
  id: TemplateId;
  name: string;
  tagline: string;
  className?: string;
}) {
  return (
    <article data-template-card className={cn("min-w-0", className)}>
      <div className="overflow-hidden rounded-2xl border border-border shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
        <SlidePreview>
          <ProjectSlide story={{ ...EXAMPLE_STORY, template: id }} />
        </SlidePreview>
      </div>
      <h3 className="mt-4 hidden font-display text-xl tracking-tight sm:block">{name}</h3>
      <p className="mt-1.5 hidden text-sm text-muted sm:block">{tagline}</p>
    </article>
  );
}
