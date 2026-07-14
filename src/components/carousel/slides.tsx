"use client";

import type { ProjectStory, TemplateId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Cpu,
  ExternalLink,
  GitBranch,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type SlideKind = "project" | "built" | "engineering" | "shipped";

type Theme = {
  base: string;
  text: string;
  muted: string;
  border: string;
  rule: string;
  accents: Record<SlideKind, string>;
};

const THEMES: Record<TemplateId, Theme> = {
  minimal: {
    base: "#F4F3EE",
    text: "#0A0A0A",
    muted: "rgba(10,10,10,0.52)",
    border: "rgba(10,10,10,0.1)",
    rule: "rgba(10,10,10,0.12)",
    accents: {
      project: "#7C3AED",
      built: "#84CC16",
      engineering: "#EC4899",
      shipped: "#38BDF8",
    },
  },
  dark: {
    base: "#07090E",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.55)",
    border: "rgba(255,255,255,0.12)",
    rule: "rgba(255,255,255,0.16)",
    accents: {
      project: "#A78BFA",
      built: "#A3E635",
      engineering: "#F472B6",
      shipped: "#7DD3FC",
    },
  },
  gradient: {
    base: "#06050A",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.58)",
    border: "rgba(255,255,255,0.14)",
    rule: "rgba(255,255,255,0.18)",
    accents: {
      project: "#C084FC",
      built: "#A3E635",
      engineering: "#F472B6",
      shipped: "#7DD3FC",
    },
  },
};

const FEATURE_ICONS: LucideIcon[] = [Sparkles, Layers, Code2, Cpu, CheckCircle2, Sparkles];
const ENG_ICONS: LucideIcon[] = [Cpu, Layers, Code2, CheckCircle2, Sparkles];

function hexAlpha(hex: string, alpha: number) {
  const n = Math.max(0, Math.min(1, alpha));
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${n.toFixed(3)})`;
}

function Atmosphere({
  color,
  template,
  kind,
}: {
  color: string;
  template: TemplateId;
  kind: SlideKind;
}) {
  const light = template === "minimal";
  const intensity = template === "gradient" ? 0.38 : light ? 0.16 : 0.28;
  const a =
    kind === "project"
      ? { x: "82%", y: "12%", s: "70%" }
      : kind === "built"
        ? { x: "18%", y: "20%", s: "65%" }
        : kind === "engineering"
          ? { x: "78%", y: "78%", s: "68%" }
          : { x: "22%", y: "85%", s: "72%" };
  const b =
    kind === "project"
      ? { x: "12%", y: "88%", s: "55%" }
      : kind === "built"
        ? { x: "88%", y: "75%", s: "50%" }
        : kind === "engineering"
          ? { x: "15%", y: "18%", s: "52%" }
          : { x: "85%", y: "18%", s: "58%" };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[20%] opacity-90"
        style={{
          background: `
            radial-gradient(ellipse ${a.s} ${a.s} at ${a.x} ${a.y},
              ${hexAlpha(color, intensity)} 0%,
              ${hexAlpha(color, intensity * 0.45)} 28%,
              ${hexAlpha(color, intensity * 0.12)} 52%,
              transparent 72%),
            radial-gradient(ellipse ${b.s} ${b.s} at ${b.x} ${b.y},
              ${hexAlpha(color, intensity * 0.55)} 0%,
              ${hexAlpha(color, intensity * 0.18)} 35%,
              transparent 65%)
          `,
          filter: "blur(2px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: light
            ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 40%, rgba(244,243,238,0.55) 100%)"
            : "radial-gradient(ellipse 85% 70% at 50% 40%, transparent 35%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </>
  );
}

function Shell({
  story,
  kind,
  children,
}: {
  story: ProjectStory;
  kind: SlideKind;
  children: React.ReactNode;
}) {
  const theme = THEMES[story.template];
  const accent = theme.accents[kind];

  return (
    <div
      className="relative flex aspect-[4/5] h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px]"
      style={{
        background: theme.base,
        color: theme.text,
        border: `1px solid ${theme.border}`,
      }}
    >
      <Atmosphere color={accent} template={story.template} kind={kind} />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[8%] py-[8%]">
        {children}
      </div>
    </div>
  );
}

function CardHeader({
  index,
  label,
  accent,
  muted,
}: {
  index: string;
  label: string;
  accent: string;
  muted: string;
}) {
  return (
    <div>
      <p className="font-mono text-[1.5rem] tracking-[0.08em]" style={{ color: muted }}>
        {index}
      </p>
      <p
        className="mt-4 font-mono text-[1.35rem] tracking-[0.22em] uppercase"
        style={{ color: accent }}
      >
        {label}
      </p>
    </div>
  );
}

function IconRow({
  icon: Icon,
  accent,
  title,
  subtitle,
  muted,
}: {
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle?: string;
  muted: string;
}) {
  return (
    <div className="flex gap-5">
      <div
        className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: accent, color: accent }}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-[2.75rem] leading-[1.05] tracking-[-0.03em]">{title}</p>
        {subtitle ? (
          <p className="mt-2 text-[1.5rem] leading-snug" style={{ color: muted }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function stack(story: ProjectStory) {
  return (story.technologies.length ? story.technologies : story.languages).slice(0, 5);
}

/** Card 1 — Project Snapshot */
export function ProjectSlide({ story }: { story: ProjectStory }) {
  const theme = THEMES[story.template];
  const accent = theme.accents.project;
  const title = story.customTitle || story.name;
  const tagline = story.carousel.tagline || story.description;
  const techs = stack(story);
  const demo = story.carousel.homepage;
  const year = story.pushedAt
    ? new Date(story.pushedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <Shell story={story} kind="project">
      <CardHeader index="01" label="Project Snapshot" accent={accent} muted={theme.muted} />

      <h2 className="mt-10 font-display text-[8rem] leading-[0.88] tracking-[-0.055em] break-words">
        {title}
      </h2>

      <p className="mt-8 max-w-[20ch] text-[2.25rem] leading-snug" style={{ color: accent, opacity: 0.9 }}>
        {tagline}
      </p>

      <ul className="mt-12 flex min-h-0 flex-1 flex-col justify-evenly">
        {techs.map((tech) => (
          <li key={tech} className="flex items-center gap-5">
            <Code2 className="h-8 w-8 shrink-0" style={{ color: accent }} strokeWidth={1.75} />
            <span className="font-display text-[2.5rem] tracking-[-0.02em]">{tech}</span>
          </li>
        ))}
      </ul>

      <div className="pt-6">
        {demo ? (
          <p className="inline-flex items-center gap-3 text-[2rem] font-medium" style={{ color: accent }}>
            Live Demo
            <ArrowUpRight className="h-7 w-7" />
          </p>
        ) : null}
        <div
          className="mt-6 flex items-center justify-between gap-3 font-mono text-[1.25rem] tracking-wide"
          style={{ color: theme.muted }}
        >
          <span>GitWrapped</span>
          {year ? <span>{year}</span> : null}
        </div>
      </div>
    </Shell>
  );
}

/** Card 2 — What I Built */
export function BuiltSlide({ story }: { story: ProjectStory }) {
  const theme = THEMES[story.template];
  const accent = theme.accents.built;
  const features = story.carousel.features.slice(0, 5);

  return (
    <Shell story={story} kind="built">
      <CardHeader index="02" label="What I Built" accent={accent} muted={theme.muted} />

      <h2 className="mt-10 max-w-[11ch] font-display text-[6.25rem] leading-[0.9] tracking-[-0.05em]">
        Core features I shipped.
      </h2>

      <ul className="mt-12 flex min-h-0 flex-1 flex-col justify-evenly overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {features.map((f, i) => (
          <li key={f.id}>
            <IconRow
              icon={FEATURE_ICONS[i % FEATURE_ICONS.length]}
              accent={accent}
              title={f.text}
              muted={theme.muted}
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

/** Card 3 — Engineering */
export function EngineeringSlide({ story }: { story: ProjectStory }) {
  const theme = THEMES[story.template];
  const accent = theme.accents.engineering;
  const items = story.carousel.engineering.slice(0, 5);

  return (
    <Shell story={story} kind="engineering">
      <CardHeader
        index="03"
        label="Engineering Highlights"
        accent={accent}
        muted={theme.muted}
      />

      <h2 className="mt-10 max-w-[10ch] font-display text-[6.25rem] leading-[0.9] tracking-[-0.05em]">
        Behind the build.
      </h2>

      <ul className="mt-12 flex min-h-0 flex-1 flex-col justify-evenly overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((e, i) => (
          <li key={e.id}>
            <IconRow
              icon={ENG_ICONS[i % ENG_ICONS.length]}
              accent={accent}
              title={e.text}
              muted={theme.muted}
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

/** Card 4 — Shipped */
export function ShippedSlide({ story }: { story: ProjectStory }) {
  const theme = THEMES[story.template];
  const accent = theme.accents.shipped;
  const points = story.carousel.shipped.slice(0, story.carousel.proofImage ? 3 : 4);
  const links = story.carousel.links.slice(0, 3);
  const proofImage = story.carousel.proofImage;
  const proofLink = story.carousel.proofLink;

  return (
    <Shell story={story} kind="shipped">
      <CardHeader
        index="04"
        label="Shipped & What's Next"
        accent={accent}
        muted={theme.muted}
      />

      <h2 className="mt-8 max-w-[11ch] font-display text-[5.5rem] leading-[0.9] tracking-[-0.05em]">
        Shipped. And moving forward.
      </h2>

      <ul className="mt-8 space-y-5">
        {points.map((p) => (
          <li key={p.id}>
            <IconRow
              icon={CheckCircle2}
              accent={accent}
              title={p.text}
              muted={theme.muted}
            />
          </li>
        ))}
      </ul>

      {proofImage ? (
        <div
          className="mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl border"
          style={{ borderColor: theme.border }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofImage}
            alt="Project proof"
            className="h-full max-h-[38%] min-h-[180px] w-full object-cover"
          />
        </div>
      ) : null}

      {proofLink ? (
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border px-5 py-5",
            proofImage ? "mt-4" : "mt-8",
          )}
          style={{ borderColor: accent, color: accent }}
        >
          <ExternalLink className="h-8 w-8 shrink-0" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="font-mono text-[1.1rem] tracking-[0.16em] uppercase">Proof link</p>
            <p className="mt-1 truncate font-display text-[1.85rem] tracking-[-0.02em]">
              {proofLink.replace(/^https?:\/\//, "")}
            </p>
          </div>
          <ArrowUpRight className="ml-auto h-7 w-7 shrink-0" />
        </div>
      ) : null}

      {!proofImage && !proofLink ? (
        <div
          className="mt-8 rounded-2xl border border-dashed px-5 py-8 text-center"
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <p className="font-mono text-[1.1rem] tracking-[0.16em] uppercase">Add proof</p>
          <p className="mt-2 text-[1.45rem]">Paste a link and/or image in the editor</p>
        </div>
      ) : null}

      {story.carousel.periodLabel && !proofImage ? (
        <p className="mt-5 text-[1.5rem] leading-snug" style={{ color: theme.muted }}>
          {story.carousel.periodLabel}
        </p>
      ) : null}

      <div className="mt-auto flex gap-10 pt-6">
        {links.map((link) => {
          const Icon =
            /demo|live/i.test(link.label)
              ? ExternalLink
              : /git/i.test(link.label)
                ? GitBranch
                : ArrowUpRight;
          return (
            <div key={link.label} className="flex flex-col items-center gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-2"
                style={{ borderColor: accent, color: accent }}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <span className="font-mono text-[1.1rem] tracking-wide" style={{ color: theme.muted }}>
                {link.label.replace(/^View /, "")}
              </span>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/** @deprecated Use ProjectSlide */
export const CoverSlide = ProjectSlide;

export const SLIDE_COMPONENTS = [
  { id: "project", label: "Project", Component: ProjectSlide },
  { id: "built", label: "What I Built", Component: BuiltSlide },
  { id: "engineering", label: "Engineering", Component: EngineeringSlide },
  { id: "shipped", label: "Shipped", Component: ShippedSlide },
] as const;
