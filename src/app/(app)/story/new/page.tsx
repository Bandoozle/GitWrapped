"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  GripVertical,
  ImagePlus,
  Link2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { upsertProject, useProject } from "@/lib/story-store";
import type { ProjectStory, RepoOption, StoryCarousel, StoryItem, TemplateId } from "@/lib/types";
import { SOURCE_LABELS, TEMPLATES, newStoryItem, normalizeCarousel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProjectSlide, SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { Button } from "@/components/ui/button";
import { fieldClass, Input, Textarea } from "@/components/ui/field";
import { RepoImportLoading, RepoSelectPanel } from "@/components/story/repo-select-panel";

const steps = ["Select repository", "Choose template", "Edit story"] as const;
const ease = [0.22, 1, 0.36, 1] as const;
const TAGLINE_MAX = 220;

type ListKey = "features" | "engineering" | "shipped";

/**
 * Keeps a local draft while focused so parse/trim/join cycles don't eat spaces.
 * Still calls onRawChange on every keystroke so the live preview stays in sync.
 */
function CommitOnBlurInput({
  id,
  value,
  onRawChange,
  className,
  placeholder,
  type = "text",
  inputMode,
}: {
  id?: string;
  value: string;
  onRawChange: (next: string) => void;
  className?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value;

  return (
    <Input
      id={id}
      type={type}
      inputMode={inputMode}
      className={className}
      placeholder={placeholder}
      value={shown}
      onFocus={() => setDraft(value)}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        onRawChange(next);
      }}
      onBlur={() => {
        const next = draft ?? value;
        setDraft(null);
        onRawChange(next);
      }}
    />
  );
}

function parseStack(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeStory(existing: ProjectStory): ProjectStory {
  return {
    ...existing,
    carousel: normalizeCarousel(existing.carousel, {
      activityStatus: existing.activityStatus,
      contributors: existing.contributors,
      homepage: existing.homepage,
    }),
  };
}

function NewStoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Existing story id when editing, or a repo id/fullName to preselect for a fresh import. */
  const editId = searchParams.get("edit");
  const initialRepo = searchParams.get("repo");
  const { status } = useSession();
  const storedEdit = useProject(editId ?? "");

  const [githubEnabled, setGithubEnabled] = useState(false);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [repoQuery, setRepoQuery] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const editingExisting = Boolean(editId && storedEdit);
  const [step, setStep] = useState(editId ? 2 : 0);
  const [repoId, setRepoId] = useState(initialRepo ?? editId ?? "");
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState<ProjectStory | null>(null);
  const [previewSlide, setPreviewSlide] = useState(0);

  // Prefer the in-progress draft; fall back to the stored story when editing.
  const story = draft ?? (editingExisting ? normalizeStory(storedEdit!) : null);
  const setStory = setDraft;

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
    // Editing an existing story — no need to fetch the repo list.
    if (editingExisting || editId) return;

    let cancelled = false;

    const loadRepos = async () => {
      if (status === "unauthenticated") {
        if (!cancelled) {
          setRepos([]);
          setLoadingRepos(false);
        }
        return;
      }
      if (!githubEnabled || status !== "authenticated") return;

      setLoadingRepos(true);
      setRepoError(null);
      try {
        const r = await fetch("/api/github/repos");
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load repos");
        if (cancelled) return;
        const list = data.repos as RepoOption[];
        setRepos(list);
        if (initialRepo) {
          const match = list.find((r) => r.id === initialRepo || r.fullName === initialRepo);
          if (match) setRepoId(match.id);
        }
      } catch (err) {
        if (cancelled) return;
        setRepoError(err instanceof Error ? err.message : "Failed to load repos");
        setRepos([]);
      } finally {
        if (!cancelled) setLoadingRepos(false);
      }
    };

    void loadRepos();

    return () => {
      cancelled = true;
    };
  }, [githubEnabled, status, initialRepo, editingExisting, editId]);

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
      const imported = data.story as ProjectStory;
      setStory(normalizeStory(imported));
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
    const caps: Record<ListKey, number> = {
      features: 4,
      engineering: 4,
      shipped: 4,
    };
    if (story.carousel[key].length >= caps[key]) return;
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

  if (editId && storedEdit === null) {
    return (
      <p className="py-16 text-center text-sm text-muted" role="status">
        Loading story…
      </p>
    );
  }

  if (editId && storedEdit === undefined) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          Story not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          It may have been removed or created on another device.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => router.push("/dashboard")}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {editingExisting ? "Edit story" : "New story"} · Step {step + 1} of {steps.length}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-balance text-foreground">
          {editingExisting && step === 2 ? "Edit story" : steps[step]}
        </h1>
        <div
          className="mt-6 flex gap-2"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        >
          {steps.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300 ease-out",
                i <= step ? "bg-accent" : "bg-border",
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
          >
            {!signedIn ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0a0a0c] p-8 text-center">
                <p className="text-zinc-400">
                  Sign in with GitHub to import your public repositories. GitWrapped does not
                  request access to private repos or organizations.
                </p>
                <Button
                  onClick={() => signIn("github", { callbackUrl: "/story/new" })}
                  className="mt-4"
                >
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  Continue with GitHub
                </Button>
              </div>
            ) : importing ? (
              <RepoImportLoading repoName={selectedRepo?.name ?? "repository"} />
            ) : (
              <RepoSelectPanel
                repos={repos}
                filteredRepos={filteredRepos}
                selectedId={repoId}
                query={repoQuery}
                loading={loadingRepos}
                error={repoError}
                onQueryChange={setRepoQuery}
                onSelect={(repo) => setRepoId(repo.id)}
                onImport={(repo) => {
                  setRepoId(repo.id);
                  void runImport(repo);
                }}
              />
            )}
          </motion.div>
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
                    aria-pressed={selected}
                    aria-label={`Use ${template.name} template`}
                    onClick={() =>
                      setStory({ ...story, template: template.id as TemplateId })
                    }
                    className={cn(
                      "w-full justify-self-center overflow-hidden rounded-2xl text-left transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.99]",
                      "ring-2 ring-offset-2 ring-offset-background",
                      selected
                        ? "ring-white"
                        : "ring-transparent hover:ring-white/20",
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
              <Button
                variant="ghost"
                onClick={() => {
                  if (editingExisting && story) {
                    router.push(`/story/${story.id}`);
                    return;
                  }
                  setStep(0);
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button onClick={() => setStep(2)}>
                Edit story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && story && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start"
          >
            <div className="space-y-10">
              <section className="space-y-3">
                <h3 className="font-display text-xl tracking-tight">Template</h3>
                <p className="text-sm text-muted">
                  Switch the look anytime — the live preview updates immediately.
                </p>
                <div
                  className="grid gap-2 sm:grid-cols-3"
                  role="radiogroup"
                  aria-label="Carousel template"
                >
                  {TEMPLATES.map((template) => {
                    const selected = story.template === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setStory({ ...story, template: template.id as TemplateId })
                        }
                        className={cn(
                          "rounded-xl border px-3.5 py-3 text-left transition-colors duration-150",
                          selected
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-surface text-muted hover:border-white/25 hover:text-foreground",
                        )}
                      >
                        <span className="block text-sm font-medium text-foreground">
                          {template.name}
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-muted">
                          {template.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-xl tracking-tight">1 · Project Snapshot</h3>
                <p className="text-sm text-muted">
                  What is this, why does it exist, and can I see it?
                </p>
                <label htmlFor="story-title" className="block text-sm text-muted">
                  Title
                </label>
                <Input
                  id="story-title"
                  value={story.customTitle ?? story.name}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      customTitle: e.target.value,
                      name: e.target.value,
                    })
                  }
                />
                <label htmlFor="story-description" className="block text-sm text-muted">
                  Problem + solution
                </label>
                <Textarea
                  id="story-description"
                  value={story.carousel.tagline}
                  maxLength={TAGLINE_MAX}
                  onChange={(e) => {
                    const tagline = e.target.value.slice(0, TAGLINE_MAX);
                    setStory({
                      ...story,
                      description: tagline,
                      carousel: { ...story.carousel, tagline },
                    });
                  }}
                  rows={3}
                  placeholder="A real-time assistant that turns live conversations into answers and next steps."
                />
                <p className="text-right font-mono text-[11px] tabular-nums text-muted">
                  {story.carousel.tagline.length}/{TAGLINE_MAX}
                </p>
                <label htmlFor="story-role" className="block text-sm text-muted">
                  Your role
                </label>
                <Input
                  id="story-role"
                  value={story.carousel.role ?? ""}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      carousel: {
                        ...story.carousel,
                        role: e.target.value,
                      },
                    })
                  }
                  onBlur={(e) => {
                    const role = e.target.value.trim() || null;
                    setStory({
                      ...story,
                      carousel: { ...story.carousel, role },
                    });
                  }}
                  placeholder="Full-stack and AI development"
                />
                <label htmlFor="story-status" className="block text-sm text-muted">
                  Project status
                </label>
                <Input
                  id="story-status"
                  value={story.carousel.statusLabel}
                  onChange={(e) =>
                    setStory({
                      ...story,
                      carousel: { ...story.carousel, statusLabel: e.target.value },
                    })
                  }
                  placeholder="Working prototype"
                />
                <label htmlFor="story-stack" className="block text-sm text-muted">
                  Stack
                </label>
                <CommitOnBlurInput
                  id="story-stack"
                  value={story.technologies.join(", ")}
                  onRawChange={(raw) =>
                    setStory({
                      ...story,
                      technologies: parseStack(raw),
                    })
                  }
                  className="font-mono"
                  placeholder="Python, JavaScript, Gemini API"
                />
              </section>

              <ProofMediaEditor
                story={story}
                onChange={(patch) => {
                  const proofLink =
                    "proofLink" in patch
                      ? patch.proofLink ?? null
                      : story.carousel.proofLink;
                  let links = story.carousel.links.filter((l) => l.label !== "View Demo");
                  if (proofLink) links = [{ label: "View Demo", url: proofLink }, ...links];
                  setStory({
                    ...story,
                    homepage: proofLink,
                    carousel: {
                      ...story.carousel,
                      ...patch,
                      homepage: proofLink,
                      links,
                    },
                  });
                }}
              />

              <EditableList
                title="2 · What I Built"
                hint="Three or four product capabilities — not raw commits. Remove anything GitHub misread."
                items={story.carousel.features}
                maxItems={4}
                onReorder={(next) => updateList("features", next)}
                onChange={(id, text) => patchItem("features", id, text)}
                onAdd={() => addItem("features")}
                onRemove={(id) => removeItem("features", id)}
              />

              <section className="space-y-3">
                <h3 className="font-display text-xl tracking-tight">3 · How It Works</h3>
                <p className="text-sm text-muted">
                  Architecture flow plus up to four engineering highlights.
                </p>
                <ArchitectureFlowEditor
                  steps={story.carousel.architectureFlow ?? []}
                  onChange={(architectureFlow) =>
                    setStory({
                      ...story,
                      carousel: { ...story.carousel, architectureFlow },
                    })
                  }
                />
              </section>

              <EditableList
                title="Engineering highlights"
                hint="Architecture, integrations, and decisions — only claims the repo can support."
                items={story.carousel.engineering}
                maxItems={4}
                onReorder={(next) => updateList("engineering", next)}
                onChange={(id, text) => patchItem("engineering", id, text)}
                onAdd={() => addItem("engineering")}
                onRemove={(id) => removeItem("engineering", id)}
              />

              <EditableList
                title="4 · What It Achieved"
                hint="Outcomes and delivery milestones — never invent user or business metrics."
                items={story.carousel.shipped}
                maxItems={4}
                onReorder={(next) => updateList("shipped", next)}
                onChange={(id, text) => patchItem("shipped", id, text)}
                onAdd={() => addItem("shipped")}
                onRemove={(id) => removeItem("shipped", id)}
              />
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div
                className="mb-3 flex gap-2 overflow-x-auto"
                role="tablist"
                aria-label="Preview slide"
              >
                {SLIDE_COMPONENTS.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={previewSlide === i}
                    onClick={() => setPreviewSlide(i)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors duration-150 ease-out",
                      previewSlide === i
                        ? "bg-accent text-accent-fg"
                        : "bg-surface-2 text-muted hover:text-foreground",
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
              <div className="mt-6 flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button onClick={() => void finish()}>
                  Generate & share
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
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
        <h3 className="font-display text-xl tracking-tight">Project media</h3>
        <p className="mt-1 text-sm text-muted">
          Add a screenshot and link — tapping the image on Project Snapshot opens the link.
        </p>
      </div>

      <label htmlFor="proof-link" className="block text-sm text-muted">
        Demo / project link
      </label>
      <div className="relative">
        <Link2
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="proof-link"
          type="url"
          inputMode="url"
          value={proofLink}
          onChange={(e) => {
            setError(null);
            onChange({ proofLink: e.target.value });
          }}
          onBlur={(e) => {
            const v = e.target.value.trim();
            onChange({ proofLink: v || null });
          }}
          placeholder="https://demo.example.com"
          className={cn(fieldClass, "py-3 pr-4 pl-10")}
        />
      </div>

      <label htmlFor="proof-image-url" className="block text-sm text-muted">
        Image URL
      </label>
      <div className="relative">
        <ImagePlus
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="proof-image-url"
          value={proofImage && !proofImage.startsWith("data:") ? proofImage : ""}
          onChange={(e) => {
            setError(null);
            const v = e.target.value;
            if (!v.trim()) {
              onChange({ proofImage: null });
              return;
            }
            onChange({ proofImage: v });
          }}
          onBlur={(e) => {
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
          className={cn(fieldClass, "py-3 pr-4 pl-10")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-white/25 hover:text-foreground focus-within:ring-2 focus-within:ring-white/40">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
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
          <img src={proofImage} alt="Screenshot preview" className="max-h-48 w-full object-cover" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Paste an image here, upload a file, or paste an image URL above.
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function ArchitectureFlowEditor({
  steps: flowSteps,
  onChange,
  maxSteps = 5,
}: {
  steps: string[];
  onChange: (next: string[]) => void;
  maxSteps?: number;
}) {
  const atCap = flowSteps.length >= maxSteps;

  function updateAt(index: number, text: string) {
    onChange(flowSteps.map((step, i) => (i === index ? text : step)));
  }

  function removeAt(index: number) {
    onChange(flowSteps.filter((_, i) => i !== index));
  }

  function addStep() {
    if (atCap) return;
    onChange([...flowSteps, ""]);
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Architecture flow</p>
          <p className="mt-1 text-xs text-muted/80">
            Add each stage as its own step — arrows are joined automatically on the card.
          </p>
        </div>
        <button
          type="button"
          onClick={addStep}
          disabled={atCap}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </button>
      </div>

      {flowSteps.length === 0 ? (
        <button
          type="button"
          onClick={addStep}
          className="mt-3 w-full rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted transition-colors hover:border-white/25 hover:text-foreground"
        >
          Add your first architecture step
        </button>
      ) : (
        <ul className="mt-3 space-y-2">
          {flowSteps.map((step, index) => (
            <li key={`flow-${index}`} className="flex items-center gap-2">
              <span className="w-7 shrink-0 font-mono text-[11px] tabular-nums text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index > 0 ? (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted/70" aria-hidden="true" />
              ) : (
                <span className="w-3.5 shrink-0" aria-hidden="true" />
              )}
              <input
                value={step}
                aria-label={`Architecture step ${index + 1}`}
                placeholder={
                  index === 0
                    ? "e.g. Live transcript"
                    : index === 1
                      ? "e.g. Relevance filter"
                      : "Next stage…"
                }
                onChange={(e) => updateAt(index, e.target.value)}
                onBlur={(e) => updateAt(index, e.target.value.trim())}
                className={cn(
                  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
                  "placeholder:text-muted/60 outline-none transition-[border-color,box-shadow] duration-150",
                  "hover:border-white/25 focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
                )}
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="rounded-md p-1.5 text-muted transition-colors hover:text-foreground active:scale-[0.97]"
                aria-label={`Remove step ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditableList({
  title,
  hint,
  items,
  maxItems,
  onReorder,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  items: StoryItem[];
  maxItems?: number;
  onReorder: (next: StoryItem[]) => void;
  onChange: (id: string, text: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const atCap = typeof maxItems === "number" && items.length >= maxItems;

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
          disabled={atCap}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </button>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={onReorder} className="mt-4 space-y-2">
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2.5"
          >
            <GripVertical
              className="mt-2.5 h-4 w-4 shrink-0 cursor-grab text-muted"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="relative">
                <input
                  value={item.text}
                  aria-label={`Edit ${title} item`}
                  placeholder="Click to edit…"
                  onChange={(e) => onChange(item.id, e.target.value)}
                  className={cn(
                    "w-full rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground",
                    "placeholder:text-muted/70 outline-none transition-[border-color,box-shadow] duration-150",
                    "hover:border-white/25 focus:border-white/40 focus:ring-2 focus:ring-white/15",
                  )}
                />
                <Pencil
                  className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted/70"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 px-1 font-mono text-[10px] tracking-wide text-muted">
                {SOURCE_LABELS[item.source]}
                {item.basis ? ` · Based on: ${item.basis}` : null}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="mt-1.5 rounded-md p-1.5 text-muted transition-colors hover:text-foreground active:scale-[0.97]"
              aria-label={`Remove ${title} item`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
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
