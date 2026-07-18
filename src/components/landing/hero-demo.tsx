"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { EXAMPLE_STORY } from "@/lib/preview-story";
import { SLIDE_COMPONENTS } from "@/components/carousel/slides";
import { SlidePreview } from "@/components/carousel/slide-preview";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const REPOS = [
  { name: "GitWrapped", meta: "TypeScript · Next.js · Auth.js" },
  { name: "HomeHub", meta: "TypeScript · Next.js" },
  { name: "pulse-board", meta: "React · Supabase" },
] as const;

/** Same example story, but keep the cleaner demo image treatment (no link arrow). */
const DEMO_STORY = {
  ...EXAMPLE_STORY,
  carousel: {
    ...EXAMPLE_STORY.carousel,
    proofLink: null,
  },
};

type Phase =
  | { kind: "pick" }
  | { kind: "import" }
  | { kind: "card"; card: number };

const PHASES: { phase: Phase; ms: number }[] = [
  { phase: { kind: "pick" }, ms: 2400 },
  { phase: { kind: "import" }, ms: 1400 },
  { phase: { kind: "card", card: 0 }, ms: 2800 },
  { phase: { kind: "card", card: 1 }, ms: 2600 },
  { phase: { kind: "card", card: 2 }, ms: 2600 },
  { phase: { kind: "card", card: 3 }, ms: 2800 },
];

function phaseKey(p: Phase) {
  return p.kind === "card" ? `card-${p.card}` : p.kind;
}

function DemoSlide({ index }: { index: number }) {
  const Slide = SLIDE_COMPONENTS[index]!.Component;
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl">
      <SlidePreview className="h-full !aspect-auto">
        <Slide story={DEMO_STORY} />
      </SlidePreview>
    </div>
  );
}

function PickPhase({ selected }: { selected: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a0a0c] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">Select repository</p>
        <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
          Step 1
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Import from GitHub to generate your carousel</p>
      <ul className="mt-4 space-y-2">
        {REPOS.map((repo, i) => {
          const active = i === 0 && selected;
          return (
            <li
              key={repo.name}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
                active
                  ? "border-accent/40 bg-accent-soft"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs",
                  active ? "bg-accent/20 text-accent" : "bg-white/5 text-zinc-400",
                )}
              >
                {repo.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{repo.name}</p>
                <p className="truncate font-mono text-[10px] text-zinc-500">{repo.meta}</p>
              </div>
              {active ? (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </motion.span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ImportPhase() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0c] px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        className="text-accent"
      >
        <LoaderCircle className="h-8 w-8" aria-hidden />
      </motion.div>
      <p className="mt-5 text-sm font-medium text-white">Reading GitWrapped…</p>
      <p className="mt-2 max-w-[28ch] text-xs leading-relaxed text-zinc-500">
        Pulling README, commits, CI, and stack into four recruiter-ready cards
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["README", "Commits", "CI", "Releases"].map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i, duration: 0.3, ease }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] tracking-wide text-zinc-400"
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function HeroUseCaseDemo() {
  const reduceMotion = useReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [picked, setPicked] = useState(false);

  const current = PHASES[phaseIndex]!.phase;

  useEffect(() => {
    if (reduceMotion) return;

    if (current.kind === "pick") {
      setPicked(false);
      const t = window.setTimeout(() => setPicked(true), 900);
      return () => window.clearTimeout(t);
    }
    setPicked(true);
  }, [current, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const ms = PHASES[phaseIndex]!.ms;
    const t = window.setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, ms);
    return () => window.clearTimeout(t);
  }, [phaseIndex, reduceMotion]);

  const stepLabel =
    current.kind === "pick"
      ? "Import a repository"
      : current.kind === "import"
        ? "Generate the story"
        : "Share the carousel";

  if (reduceMotion) {
    return (
      <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] ring-1 ring-white/10">
          <DemoSlide index={0} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(163,230,53,0.14), transparent 70%)",
        }}
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        {current.kind !== "card" ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-3.5 sm:px-5 sm:pt-4">
            <p className="inline-flex items-center gap-2 text-xs leading-none text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span className="font-medium text-zinc-300">{stepLabel}</span>
            </p>
            <div className="flex h-1 shrink-0 items-center gap-1.5" aria-hidden>
              {PHASES.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 w-3.5 rounded-full transition-colors duration-300 sm:w-4",
                    i === phaseIndex ? "bg-accent" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end px-4 pt-3.5 sm:px-5 sm:pt-4">
            <div className="flex h-1 shrink-0 items-center gap-1.5" aria-hidden>
              {PHASES.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 w-3.5 rounded-full transition-colors duration-300 sm:w-4",
                    i === phaseIndex ? "bg-accent" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={phaseKey(current)}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
            className={cn(
              "absolute inset-0",
              current.kind !== "card" && "pt-9 sm:pt-10",
            )}
          >
            {current.kind === "pick" ? (
              <PickPhase selected={picked} />
            ) : current.kind === "import" ? (
              <ImportPhase />
            ) : (
              <DemoSlide index={current.card} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Repo → four cards → live share link
      </p>
    </div>
  );
}
