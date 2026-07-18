"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Check, Copy, Download, ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { upsertProject, useProject } from "@/lib/story-store";
import { EXPORT_SIZES, type ExportFormat } from "@/lib/types";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { cn } from "@/lib/utils";
import { Button, buttonClass } from "@/components/ui/button";

export default function ExportPage() {
  const params = useParams<{ id: string }>();
  const story = useProject(params.id);
  const [format, setFormat] = useState<ExportFormat>("linkedin-portrait");
  const [slideIndex, setSlideIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  // Derived from the store so a freshly created share id shows up automatically.
  const shareUrl = useMemo(
    () =>
      story?.shareId && typeof window !== "undefined"
        ? `${window.location.origin}/s/${story.shareId}`
        : null,
    [story?.shareId],
  );

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
      const text = await res.text();
      let data: { error?: string; url?: string; id?: string } = {};
      if (text) {
        try {
          data = JSON.parse(text) as typeof data;
        } catch {
          throw new Error(
            res.ok
              ? "Share link response was invalid."
              : `Share link failed (${res.status}). Check that Vercel Blob is connected.`,
          );
        }
      }
      if (!res.ok) {
        throw new Error(data.error || `Failed to create share link (${res.status})`);
      }
      if (!data.url || !data.id) {
        throw new Error("Share link response was incomplete.");
      }
      upsertProject({ ...story, shareId: data.id });
      return data.url;
    } finally {
      setSharing(false);
    }
  }

  async function copyShareLink() {
    try {
      const url = await ensureShareLink();
      if (!url) return;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create share link";
      window.alert(message);
    }
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

  if (story === null) {
    return <p className="py-16 text-center text-sm text-muted" role="status">Loading…</p>;
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

  const Active = SLIDE_COMPONENTS[slideIndex].Component;
  const previewScale = Math.min(1, 520 / size.width);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Share &amp; export</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-balance text-foreground">
            {story.name} carousel
          </h1>
          <p className="mt-2 text-pretty text-muted">
            Share a live link — or download PNGs for LinkedIn uploads.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={sharing}
            aria-busy={sharing}
            onClick={() => void copyShareLink()}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden="true" />
            )}
            {sharing ? "Creating link…" : copied ? "Copied!" : "Copy share link"}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void downloadAll()}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {busy ? "Exporting…" : "Download PNGs"}
          </Button>
        </div>
      </div>

      {shareUrl && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
          <span className="text-muted">Live carousel</span>
          <a
            href={shareUrl}
            className="break-all font-mono text-foreground underline-offset-4 hover:underline"
          >
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-muted transition-colors hover:text-foreground active:scale-[0.97]"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
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
                  aria-pressed={format === option.id}
                  onClick={() => setFormat(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-150 ease-out active:scale-[0.99]",
                    format === option.id
                      ? "border-white bg-white/10"
                      : "border-border bg-surface hover:border-white/30",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="font-mono text-xs tabular-nums text-muted">
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
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out",
                    slideIndex === i ? "bg-white text-black" : "hover:bg-surface",
                  )}
                >
                  <button
                    type="button"
                    aria-current={slideIndex === i ? "true" : undefined}
                    onClick={() => setSlideIndex(i)}
                    className="flex-1 text-left tabular-nums"
                  >
                    {i + 1}. {slide.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadSlide(i)}
                    className={cn(
                      "rounded p-1 transition-colors active:scale-[0.97]",
                      slideIndex === i
                        ? "text-black/60 hover:text-black"
                        : "text-muted hover:text-foreground",
                    )}
                    aria-label={`Download slide ${i + 1}`}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
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
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
              disabled={slideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Prev
            </button>
            <span className="font-mono text-xs tabular-nums text-muted">
              Slide {slideIndex + 1} / {SLIDE_COMPONENTS.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setSlideIndex((i) => Math.min(SLIDE_COMPONENTS.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
              disabled={slideIndex === SLIDE_COMPONENTS.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
                  <Active story={story} format={format} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
