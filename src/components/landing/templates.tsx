"use client";

import Link from "next/link";
import { TEMPLATES } from "@/lib/types";
import { EXAMPLE_STORY } from "@/lib/preview-story";
import { ProjectSlide } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { buttonClass } from "@/components/ui/button";

export function TemplatesSection() {
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
            className={buttonClass("secondary", "md", "shrink-0 rounded-full self-start sm:self-auto")}
          >
            Start with a template
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TEMPLATES.map((template) => (
            <article key={template.id} className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-border shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
                <SlidePreview>
                  <ProjectSlide story={{ ...EXAMPLE_STORY, template: template.id }} />
                </SlidePreview>
              </div>
              <h3 className="mt-4 font-display text-xl tracking-tight">{template.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{template.tagline}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
