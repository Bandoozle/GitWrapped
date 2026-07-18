"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [previewWidth, setPreviewWidth] = useState(0);
  const [previewMaxHeight, setPreviewMaxHeight] = useState(420);
  const slideRef = useRef<HTMLDivElement>(null);
  const previewSlotRef = useRef<HTMLDivElement>(null);

  const shareUrl = useMemo(
    () =>
      story?.shareId && typeof window !== "undefined"
        ? `${window.location.origin}/s/${story.shareId}`
        : null,
    [story?.shareId],
  );

  const size = EXPORT_SIZES.find((s) => s.id === format)!;
  const widthFromHeight = (previewMaxHeight * size.width) / size.height;
  const stagedWidth =
    previewWidth > 0
      ? Math.max(1, Math.floor(Math.min(previewWidth, widthFromHeight, size.width)))
      : 0;
  const stagedHeight =
    stagedWidth > 0 ? Math.max(1, Math.floor((stagedWidth * size.height) / size.width)) : 0;
  const previewScale = stagedWidth > 0 ? stagedWidth / size.width : 0;

  useEffect(() => {
    const slot = previewSlotRef.current;
    if (!slot) return;

    const update = () => {
      // Empty full-width slot — never includes the 1080px canvas in the measurement
      const w = Math.floor(slot.getBoundingClientRect().width);
      if (w > 0) setPreviewWidth(w);
      setPreviewMaxHeight(
        Math.max(220, Math.min(480, Math.floor(window.innerHeight * 0.45))),
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(slot);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [story]);

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
    return (
      <p className="py-16 text-center text-sm text-muted" role="status">
        Loading…
      </p>
    );
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl tracking-tight text-foreground">Story not found</h1>
        <p className="mt-2 text-sm text-muted">
          It may have been removed or created on another device.
        </p>
        <Link href="/dashboard" className={buttonClass("secondary", "md", "mt-6")}>
          Back to projects
        </Link>
      </div>
    );
  }

  const Active = SLIDE_COMPONENTS[slideIndex]!.Component;

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden pb-8">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Share &amp; export
          </p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-balance break-words text-foreground sm:text-4xl">
            {story.name} carousel
          </h1>
          <p className="mt-2 text-sm text-pretty text-muted sm:text-base">
            Share a live link — or download PNGs for LinkedIn uploads.
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Button
            disabled={sharing}
            aria-busy={sharing}
            onClick={() => void copyShareLink()}
            className="min-w-0 w-full truncate sm:w-auto"
          >
            {copied ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">
              {sharing ? "Creating…" : copied ? "Copied!" : "Copy link"}
            </span>
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void downloadAll()}
            className="min-w-0 w-full truncate sm:w-auto"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{busy ? "Exporting…" : "Download"}</span>
          </Button>
        </div>
      </div>

      {shareUrl ? (
        <div className="mt-4 flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4">
          <span className="shrink-0 text-muted">Live carousel</span>
          <a
            href={shareUrl}
            className="min-w-0 break-all font-mono text-xs text-foreground underline-offset-4 hover:underline sm:text-sm"
          >
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className="inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-muted transition-colors hover:text-foreground active:scale-[0.97] sm:ml-auto"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </button>
        </div>
      ) : null}

      <div className="mt-6 flex min-w-0 flex-col gap-6 lg:mt-10 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div className="min-w-0 lg:order-2">
          <div className="mb-3 flex items-center justify-between gap-2">
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

          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-surface-2/60 p-3 ring-1 ring-border sm:p-5">
            {/* Width probe only — keeps the 1080px canvas out of layout measurement */}
            <div ref={previewSlotRef} className="w-full min-w-0" />
            {stagedWidth > 0 ? (
              <div
                className="relative mx-auto overflow-hidden rounded-xl shadow-xl"
                style={{
                  width: stagedWidth,
                  height: stagedHeight,
                  contain: "paint",
                }}
              >
                <div
                  ref={slideRef}
                  className="absolute top-0 left-0 origin-top-left"
                  style={{
                    width: size.width,
                    height: size.height,
                    transform: `scale(${previewScale})`,
                  }}
                >
                  <div className="h-full w-full [&_>div]:h-full [&_>div]:aspect-auto [&_>div]:max-w-none">
                    <Active story={story} format={format} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="mx-auto w-full rounded-xl bg-surface-2"
                style={{ aspectRatio: `${size.width} / ${size.height}` }}
              />
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-5 lg:order-1 lg:space-y-6">
          <div className="min-w-0">
            <h2 className="text-sm text-muted">Format</h2>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-2">
              {EXPORT_SIZES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={format === option.id}
                  onClick={() => setFormat(option.id)}
                  className={cn(
                    "flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors duration-150 ease-out active:scale-[0.99] sm:text-sm lg:px-4 lg:py-3",
                    format === option.id
                      ? "border-white bg-white/10"
                      : "border-border bg-surface hover:border-white/30",
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-muted lg:inline">
                    {option.width}×{option.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm text-muted">Slides</h2>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-2">
              {SLIDE_COMPONENTS.map((slide, i) => (
                <div
                  key={slide.id}
                  className={cn(
                    "flex min-w-0 items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-xs transition-colors duration-150 ease-out sm:text-sm lg:px-3",
                    slideIndex === i ? "bg-white text-black" : "bg-surface hover:bg-surface-2",
                  )}
                >
                  <button
                    type="button"
                    aria-current={slideIndex === i ? "true" : undefined}
                    onClick={() => setSlideIndex(i)}
                    className="min-w-0 flex-1 truncate text-left tabular-nums"
                  >
                    {i + 1}. {slide.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadSlide(i)}
                    className={cn(
                      "shrink-0 rounded p-1 transition-colors active:scale-[0.97]",
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
      </div>
    </div>
  );
}
