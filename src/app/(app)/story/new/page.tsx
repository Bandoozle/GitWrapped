"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  GripVertical,
  ImagePlus,
  Link2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { upsertProject } from "@/lib/story-store";
import type { ProjectStory, RepoOption, StoryCarousel, StoryItem, TemplateId } from "@/lib/types";
import { SOURCE_LABELS, TEMPLATES, newStoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProjectSlide, SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";

const steps = ["Select repository", "Choose template", "Edit story"] as const;
const ease = [0.22, 1, 0.36, 1] as const;

type ListKey = "features" | "engineering" | "shipped";

function NewStoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRepo = searchParams.get("repo");
  const { status } = useSession();

  const [githubEnabled, setGithubEnabled] = useState(false);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [repoQuery, setRepoQuery] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [repoId, setRepoId] = useState(initialRepo ?? "");
  const [importing, setImporting] = useState(false);
  const [story, setStory] = useState<ProjectStory | null>(null);
  const [previewSlide, setPreviewSlide] = useState(0);

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === repoId || r.fullName === repoId),
    [repoId, repos],
  );

  const filteredRepos = useMemo(() => {
    const q = repoQuery.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((repo) => {
      const haystack = [repo.name, repo.fullName, repo.description, repo.language]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [repos, repoQuery]);

  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then((data: { githubAuth?: boolean }) => {
        setGithubEnabled(Boolean(data.githubAuth));
      })
      .catch(() => setGithubEnabled(false));
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      setRepos([]);
      setLoadingRepos(false);
      return;
    }
    if (!githubEnabled || status !== "authenticated") return;

    let cancelled = false;
    setLoadingRepos(true);
    setRepoError(null);

    void fetch("/api/github/repos")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load repos");
        if (cancelled) return;
        const list = data.repos as RepoOption[];
        setRepos(list);
        if (initialRepo) {
          const match = list.find((r) => r.id === initialRepo || r.fullName === initialRepo);
          if (match) setRepoId(match.id);
        }
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setRepoError(err.message);
        setRepos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRepos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [githubEnabled, status, initialRepo]);

  async function runImport(repo?: RepoOption) {
    const target = repo ?? selectedRepo;
    if (!target) return;
    setImporting(true);
    setRepoError(null);
    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: target.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setStory({
        ...(data.story as ProjectStory),
        carousel: {
          ...(data.story as ProjectStory).carousel,
          proofLink: (data.story as ProjectStory).carousel.proofLink ?? null,
          proofImage: (data.story as ProjectStory).carousel.proofImage ?? null,
        },
      });
      setStep(1);
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function updateList(key: ListKey, next: StoryItem[]) {
    if (!story) return;
    setStory({
      ...story,
      carousel: { ...story.carousel, [key]: next },
    });
  }

  function patchItem(key: ListKey, id: string, text: string) {
    if (!story) return;
    updateList(
      key,
      story.carousel[key].map((item) =>
        item.id === id ? { ...item, text, source: "custom" as const } : item,
      ),
    );
  }

  function addItem(key: ListKey) {
    if (!story) return;
    updateList(key, [...story.carousel[key], newStoryItem("New item", "custom")]);
  }

  function removeItem(key: ListKey, id: string) {
    if (!story) return;
    updateList(
      key,
      story.carousel[key].filter((item) => item.id !== id),
    );
  }

  async function finish() {
    if (!story) return;
    let shareId = story.shareId;
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, shareId }),
      });
      const data = await res.json();
      if (res.ok) shareId = data.id as string;
    } catch {
      // Local save still works even if share API fails
    }

    const saved: ProjectStory = {
      ...story,
      shareId,
      status: "generated",
      updatedAt: new Date().toISOString(),
    };
    upsertProject(saved);
    router.push(`/story/${saved.id}/export`);
  }

  const signedIn = status === "authenticated";
  const Preview = SLIDE_COMPONENTS[previewSlide]?.Component ?? ProjectSlide;

  return (
    <div className="pb-28">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
          New story
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">
          {steps[step]}
        </h1>
        <div className="mt-6 flex gap-2">
          {steps.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-white" : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="repos"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
            className="space-y-4"
          >
            {!signedIn ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-muted">Sign in to import repositories from GitHub.</p>
                <button
                  type="button"
                  onClick={() => signIn("github", { callbackUrl: "/story/new" })}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
                >
                  <GitBranch className="h-4 w-4" />
                  Continue with GitHub
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={repoQuery}
                    onChange={(e) => setRepoQuery(e.target.value)}
                    placeholder="Search repositories…"
                    className="w-full rounded-lg border border-border bg-surface py-3 pr-4 pl-10 outline-none focus:border-accent"
                  />
                </div>
                {loadingRepos ? (
                  <p className="text-sm text-muted">Loading repositories…</p>
                ) : null}
                {repoError ? <p className="text-sm text-red-400">{repoError}</p> : null}
                {filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => setRepoId(repo.id)}
                    onDoubleClick={() => {
                      setRepoId(repo.id);
                      void runImport(repo);
                    }}
                    className={cn(
                      "flex w-full items-start justify-between rounded-xl border px-5 py-4 text-left transition ease-apple",
                      repoId === repo.id
                        ? "border-white bg-white/10"
                        : "border-border bg-surface hover:border-white/30",
                    )}
                  >
                    <div className="min-w-0 pr-4">
                      <div className="font-display text-lg tracking-tight">{repo.name}</div>
                      <div className="mt-1 text-sm text-muted">{repo.description}</div>
                      <div className="mt-2 font-mono text-xs text-muted">
                        {repo.fullName} · {repo.language} · ★ {repo.stars}
                        {repo.private ? " · private" : ""}
                      </div>
                    </div>
                    {repoId === repo.id ? (
                      <Check className="h-5 w-5 shrink-0 text-foreground" />
                    ) : null}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}

        {step === 0 && signedIn && repos.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedRepo ? selectedRepo.name : "Select a repository"}
                </p>
                <p className="font-mono text-xs text-muted">
                  {selectedRepo
                    ? selectedRepo.fullName
                    : `${filteredRepos.length} of ${repos.length} shown`}
                </p>
              </div>
              <button
                type="button"
                disabled={!repoId || importing}
                onClick={() => void runImport()}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black disabled:opacity-40"
              >
                {importing ? "Importing…" : "Import & continue"}
                {!importing ? <ArrowRight className="h-4 w-4 !text-black" /> : null}
              </button>
            </div>
          </div>
        )}

        {step === 1 && story && (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
          >
            <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
              {TEMPLATES.map((template) => {
                const selected = story.template === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() =>
                      setStory({ ...story, template: template.id as TemplateId })
                    }
                    className={cn(
                      "w-full justify-self-center overflow-hidden rounded-2xl text-left transition",
                      "outline-2 outline-offset-2",
                      selected
                        ? "outline outline-white"
                        : "outline outline-transparent hover:outline-border",
                    )}
                  >
                    <SlidePreview>
                      <ProjectSlide story={{ ...story, template: template.id }} />
                    </SlidePreview>
                    <div className="border-t border-border bg-surface px-3.5 py-2.5">
                      <div className="text-sm font-medium">{template.name}</div>
                      <div className="mt-0.5 text-xs leading-snug text-muted">
                        {template.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
              >
                Edit story
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && story && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
            className="grid gap-10 lg:grid-cols-[1fr_0.95fr]"
          >
            <div className="space-y-10">
              <section className="space-y-3">
                <h3 className="font-display text-xl tracking-tight">1 · Project</h3>
                <p className="text-sm text-muted">
                  Snapshot recruiters see first — name, pitch, stack, demo.
                </p>
                <label className="text-sm text-muted">Title</label>
                <input
                  value={story.customTitle ?? story.name}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      customTitle: e.target.value,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
                />
                <label className="text-sm text-muted">Description</label>
                <textarea
                  value={story.carousel.tagline}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      description: e.target.value,
                      carousel: { ...story.carousel, tagline: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
                />
                <label className="text-sm text-muted">Live demo URL</label>
                <input
                  value={story.carousel.homepage ?? ""}
                  onChange={(e) => {
                    const homepage = e.target.value.trim() || null;
                    const links = story.carousel.links.filter((l) => l.label !== "View Demo");
                    if (homepage) links.unshift({ label: "View Demo", url: homepage });
                    setStory({
                      ...story,
                      homepage,
                      carousel: { ...story.carousel, homepage, links },
                    });
                  }}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
                />
                <label className="text-sm text-muted">Stack (supporting)</label>
                <input
                  value={story.technologies.join(", ")}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      technologies: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-accent"
                />
              </section>

              <EditableList
                title="2 · What I built"
                hint="Features and systems you delivered. Edit freely — GitHub may misread ownership."
                items={story.carousel.features}
                onReorder={(next) => updateList("features", next)}
                onChange={(id, text) => patchItem("features", id, text)}
                onAdd={() => addItem("features")}
                onRemove={(id) => removeItem("features", id)}
              />

              <EditableList
                title="3 · Engineering"
                hint="Technical depth — not just the stack."
                items={story.carousel.engineering}
                onReorder={(next) => updateList("engineering", next)}
                onChange={(id, text) => patchItem("engineering", id, text)}
                onAdd={() => addItem("engineering")}
                onRemove={(id) => removeItem("engineering", id)}
              />

              <EditableList
                title="4 · Shipped"
                hint="Evidence this is a finished, working project."
                items={story.carousel.shipped}
                onReorder={(next) => updateList("shipped", next)}
                onChange={(id, text) => patchItem("shipped", id, text)}
                onAdd={() => addItem("shipped")}
                onRemove={(id) => removeItem("shipped", id)}
              />

              <ProofMediaEditor
                story={story}
                onChange={(patch) =>
                  setStory({
                    ...story,
                    carousel: { ...story.carousel, ...patch },
                  })
                }
              />

              <section className="space-y-3">
                <label className="text-sm text-muted">Supporting context</label>
                <input
                  value={story.carousel.periodLabel}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      carousel: { ...story.carousel, periodLabel: e.target.value },
                    })
                  }
                  placeholder="Built over 6 weeks · 2 releases"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
                />
              </section>
            </div>

            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {SLIDE_COMPONENTS.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setPreviewSlide(i)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs whitespace-nowrap",
                      previewSlide === i
                        ? "bg-white !text-black"
                        : "bg-surface-2 text-muted",
                    )}
                  >
                    {slide.label}
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-border">
                <SlidePreview>
                  <Preview story={story} />
                </SlidePreview>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void finish()}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
                >
                  Generate & share
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function isImageUrl(value: string) {
  return (
    /^data:image\//i.test(value) ||
    /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(value)
  );
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function ProofMediaEditor({
  story,
  onChange,
}: {
  story: ProjectStory;
  onChange: (patch: Partial<Pick<StoryCarousel, "proofLink" | "proofImage">>) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const proofLink = story.carousel.proofLink ?? "";
  const proofImage = story.carousel.proofImage ?? null;

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > 6_000_000) {
      setError("Keep images under 6MB.");
      return;
    }
    try {
      setError(null);
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange({ proofImage: dataUrl });
    } catch {
      setError("Couldn't read that image.");
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    e.preventDefault();
    void onFile(item.getAsFile());
  }

  return (
    <section className="space-y-3" onPaste={onPaste}>
      <div>
        <h3 className="font-display text-xl tracking-tight">Proof media</h3>
        <p className="mt-1 text-sm text-muted">
          You can add both — a live link and a screenshot/image on the Shipped card.
        </p>
      </div>

      <label className="text-sm text-muted">Link</label>
      <div className="relative">
        <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={proofLink}
          onChange={(e) => {
            setError(null);
            const v = e.target.value.trim();
            onChange({ proofLink: v || null });
          }}
          placeholder="https://demo.example.com"
          className="w-full rounded-lg border border-border bg-surface py-3 pr-4 pl-10 outline-none focus:border-accent"
        />
      </div>

      <label className="text-sm text-muted">Image URL</label>
      <div className="relative">
        <ImagePlus className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={proofImage && !proofImage.startsWith("data:") ? proofImage : ""}
          onChange={(e) => {
            setError(null);
            const v = e.target.value.trim();
            if (!v) {
              onChange({ proofImage: null });
              return;
            }
            if (v.startsWith("http") || isImageUrl(v) || v.startsWith("data:image")) {
              onChange({ proofImage: v });
            } else {
              setError("Use an image URL (https://…/image.png) or upload a file.");
            }
          }}
          placeholder="https://…/screenshot.png"
          className="w-full rounded-lg border border-border bg-surface py-3 pr-4 pl-10 outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-foreground">
          <ImagePlus className="h-4 w-4" />
          Upload image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {proofImage ? (
          <button
            type="button"
            onClick={() => onChange({ proofImage: null })}
            className="text-sm text-muted hover:text-foreground"
          >
            Remove image
          </button>
        ) : null}
        {proofLink ? (
          <button
            type="button"
            onClick={() => onChange({ proofLink: null })}
            className="text-sm text-muted hover:text-foreground"
          >
            Clear link
          </button>
        ) : null}
      </div>

      {proofImage ? (
        <div className="overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofImage} alt="Proof preview" className="max-h-48 w-full object-cover" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Paste an image here, upload a file, or paste an image URL above.
        </div>
      )}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

function EditableList({
  title,
  hint,
  items,
  onReorder,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  items: StoryItem[];
  onReorder: (next: StoryItem[]) => void;
  onChange: (id: string, text: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-xl tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={onReorder} className="mt-4 space-y-2">
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted" />
            <div className="min-w-0 flex-1">
              <input
                value={item.text}
                onChange={(e) => onChange(item.id, e.target.value)}
                className="w-full bg-transparent py-1.5 text-sm outline-none"
              />
              <p className="font-mono text-[10px] tracking-wide text-muted">
                {SOURCE_LABELS[item.source]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-md p-1.5 text-muted hover:text-foreground"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </section>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense fallback={<div className="text-muted">Loading builder…</div>}>
      <NewStoryInner />
    </Suspense>
  );
}
