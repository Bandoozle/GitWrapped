"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Check, Copy, Download, ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { getProject, upsertProject } from "@/lib/story-store";
import { EXPORT_SIZES, type ExportFormat, type ProjectStory } from "@/lib/types";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { cn } from "@/lib/utils";

export default function ExportPage() {
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<ProjectStory | null>(null);
  const [format, setFormat] = useState<ExportFormat>("linkedin-portrait");
  const [slideIndex, setSlideIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const project = getProject(params.id) ?? null;
    setStory(project);
    if (project?.shareId && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/s/${project.shareId}`);
    }
  }, [params.id]);

  const size = EXPORT_SIZES.find((s) => s.id === format)!;

  async function ensureShareLink() {
    if (!story) return null;
    if (shareUrl) return shareUrl;
    setSharing(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, shareId: story.shareId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create share link");
      const url = data.url as string;
      const next = { ...story, shareId: data.id as string };
      upsertProject(next);
      setStory(next);
      setShareUrl(url);
      return url;
    } finally {
      setSharing(false);
    }
  }

  async function copyShareLink() {
    const url = await ensureShareLink();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function downloadSlide(index: number) {
    if (!slideRef.current || !story) return;
    setBusy(true);
    const previous = slideIndex;
    setSlideIndex(index);
    await new Promise((r) => setTimeout(r, 80));
    try {
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: size.width,
        height: size.height,
        style: {
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: "none",
        },
      });
      const link = document.createElement("a");
      link.download = `${story.name.toLowerCase().replace(/\s+/g, "-")}-slide-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSlideIndex(previous);
      setBusy(false);
    }
  }

  async function downloadAll() {
    if (!story) return;
    setBusy(true);
    for (let i = 0; i < SLIDE_COMPONENTS.length; i++) {
      setSlideIndex(i);
      await new Promise((r) => setTimeout(r, 100));
      if (!slideRef.current) continue;
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: size.width,
        height: size.height,
        style: {
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: "none",
        },
      });
      const link = document.createElement("a");
      link.download = `${story.name.toLowerCase().replace(/\s+/g, "-")}-slide-${i + 1}.png`;
      link.href = dataUrl;
      link.click();
      await new Promise((r) => setTimeout(r, 250));
    }
    setBusy(false);
  }

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

  const Active = SLIDE_COMPONENTS[slideIndex].Component;
  const previewScale = Math.min(1, 520 / size.width);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">Share & export</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">
            {story.name} carousel
          </h1>
          <p className="mt-2 text-muted">
            Share a live link — or download PNGs for LinkedIn uploads.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={sharing}
            onClick={() => void copyShareLink()}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black disabled:opacity-50"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {sharing ? "Creating link…" : copied ? "Copied!" : "Copy share link"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadAll()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy ? "Exporting…" : "Download PNGs"}
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
          <span className="text-muted">Live carousel</span>
          <a href={shareUrl} className="break-all font-mono text-foreground hover:underline">
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className="ml-auto inline-flex items-center gap-1 text-muted hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm text-muted">Format</h2>
            <div className="mt-3 space-y-2">
              {EXPORT_SIZES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormat(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                    format === option.id
                      ? "border-white bg-white/10"
                      : "border-border bg-surface hover:border-white/30",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="font-mono text-xs text-muted">
                    {option.width}×{option.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm text-muted">Slides</h2>
            <div className="mt-3 space-y-2">
              {SLIDE_COMPONENTS.map((slide, i) => (
                <div
                  key={slide.id}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
                    slideIndex === i ? "bg-white !text-black" : "hover:bg-surface",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSlideIndex(i)}
                    className="flex-1 text-left"
                  >
                    {i + 1}. {slide.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadSlide(i)}
                    className="rounded p-1 text-muted hover:text-foreground"
                    aria-label={`Download slide ${i + 1}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
              disabled={slideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="font-mono text-xs text-muted">
              Slide {slideIndex + 1} / {SLIDE_COMPONENTS.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setSlideIndex((i) => Math.min(SLIDE_COMPONENTS.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
              disabled={slideIndex === SLIDE_COMPONENTS.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-center overflow-auto rounded-2xl bg-surface-2/60 p-6 ring-1 ring-border">
            <div
              style={{
                width: size.width * previewScale,
                height: size.height * previewScale,
              }}
              className="overflow-hidden rounded-xl shadow-xl"
            >
              <div
                ref={slideRef}
                style={{
                  width: size.width,
                  height: size.height,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <div className="h-full w-full [&_>div]:h-full [&_>div]:aspect-auto">
                  <Active story={story} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
