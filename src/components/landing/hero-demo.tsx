"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  LoaderCircle,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const REPOS = [
  { name: "BargAI", meta: "Python · JavaScript · Gemini" },
  { name: "HomeHub", meta: "TypeScript · Next.js" },
  { name: "pulse-board", meta: "React · Supabase" },
] as const;

const LINE_ICONS: LucideIcon[] = [Sparkles, Layers, Code2, Cpu, CheckCircle2, User];

const CAROUSEL = [
  {
    index: "01",
    label: "Project Snapshot",
    title: "BargAI",
    body: "A real-time AI meeting assistant that turns live captions into summaries and next steps.",
    accent: "#A78BFA",
    lines: [
      { text: "Full-stack Developer", icon: User },
      { text: "Working prototype", icon: CheckCircle2 },
    ],
  },
  {
    index: "02",
    label: "What I Built",
    title: "What I actually delivered.",
    body: null,
    accent: "#A3E635",
    lines: [
      { text: "Live transcript capture", icon: Sparkles },
      { text: "Context-aware AI responses", icon: Layers },
      { text: "Automatic summaries & action items", icon: Code2 },
    ],
  },
  {
    index: "03",
    label: "How It Works",
    title: "The important path.",
    body: "Transcript → filter → AI → structured response",
    accent: "#F472B6",
    lines: [
      { text: "Async transcript pipeline", icon: Cpu },
      { text: "Python service ↔ JS interface", icon: Layers },
      { text: "Empty-output handling", icon: CheckCircle2 },
    ],
  },
  {
    index: "04",
    label: "What It Achieved",
    title: "What this project achieved.",
    body: "Delivery milestones — what shipped and what it unlocked.",
    accent: "#7DD3FC",
    lines: [
      { text: "Working end-to-end prototype", icon: CheckCircle2 },
      { text: "Live transcript-to-insight workflow", icon: Sparkles },
      { text: "Latest release · v1.0", icon: Code2 },
    ],
  },
] as const;

type Phase =
  | { kind: "pick" }
  | { kind: "import" }
  | { kind: "card"; card: number };

const PHASES: { phase: Phase; ms: number }[] = [
  { phase: { kind: "pick" }, ms: 2400 },
  { phase: { kind: "import" }, ms: 1400 },
  { phase: { kind: "card", card: 0 }, ms: 2400 },
  { phase: { kind: "card", card: 1 }, ms: 2400 },
  { phase: { kind: "card", card: 2 }, ms: 2800 },
];

function phaseKey(p: Phase) {
  return p.kind === "card" ? `card-${p.card}` : p.kind;
}

function hexAlpha(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function MiniCard({ card }: { card: (typeof CAROUSEL)[number] }) {
  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-6"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 85% 10%, ${hexAlpha(card.accent, 0.18)}, transparent 55%), #0a0a0c`,
      }}
    >
      <p className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 sm:text-[11px]">
        {card.index}
      </p>
      <p
        className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase sm:text-[11px]"
        style={{ color: card.accent }}
      >
        {card.label}
      </p>
      <h3 className="mt-4 font-display text-2xl leading-[1.05] tracking-tight text-white sm:text-3xl">
        {card.title}
      </h3>
      {card.body ? (
        <p className="mt-3 max-w-[34ch] text-sm leading-snug text-zinc-400 sm:text-[15px]">
          {card.body}
        </p>
      ) : null}
      <ul className="mt-5 space-y-3">
        {card.lines.map((line, i) => {
          const Icon = line.icon ?? LINE_ICONS[i % LINE_ICONS.length]!;
          return (
            <li key={line.text} className="flex items-start gap-3 text-sm text-zinc-200 sm:text-[15px]">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: card.accent, color: card.accent }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="pt-0.5 leading-snug">{line.text}</span>
            </li>
          );
        })}
      </ul>
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
      <p className="mt-5 text-sm font-medium text-white">Reading BargAI…</p>
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

  const stepIndex = phaseIndex;

  const stepLabel =
    current.kind === "pick"
      ? "Import a repository"
      : current.kind === "import"
        ? "Generate the story"
        : "Share the carousel";

  if (reduceMotion) {
    return (
      <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
        <div className="aspect-[4/5] w-full">
          <MiniCard card={CAROUSEL[0]} />
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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-3.5 sm:px-5 sm:pt-4">
          <p className="inline-flex items-center gap-2 text-xs leading-none text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            <span className="font-medium text-zinc-300">{stepLabel}</span>
          </p>
          <div className="flex h-1 shrink-0 items-center gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 w-4 rounded-full transition-colors duration-300",
                  i === stepIndex ? "bg-accent" : "bg-white/20",
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phaseKey(current)}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
            className="absolute inset-0 pt-9 sm:pt-10"
          >
            {current.kind === "pick" ? (
              <PickPhase selected={picked} />
            ) : current.kind === "import" ? (
              <ImportPhase />
            ) : (
              <MiniCard card={CAROUSEL[current.card]!} />
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
