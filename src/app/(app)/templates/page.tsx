"use client";

import { TEMPLATES } from "@/lib/types";
import { ProjectSlide } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { PREVIEW_STORY } from "@/lib/preview-story";

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-balance text-foreground">
        Templates
      </h1>
      <p className="mt-2 text-muted">Three looks. Pick one when you generate.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {TEMPLATES.map((template) => (
          <div key={template.id}>
            <div className="overflow-hidden rounded-2xl border border-border">
              <SlidePreview>
                <ProjectSlide story={{ ...PREVIEW_STORY, template: template.id }} />
              </SlidePreview>
            </div>
            <h2 className="mt-3 text-base font-medium tracking-tight">{template.name}</h2>
            <p className="mt-1 text-sm text-muted">{template.tagline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
