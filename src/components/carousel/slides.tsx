"use client";

import type { CSSProperties } from "react";
import type { ExportFormat, ProjectStory, TemplateId } from "@/lib/types";
import { TechGlyph } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type SlideKind = "project" | "built" | "engineering" | "shipped";

export type SlideProps = {
  story: ProjectStory;
  /** Export canvas format — drives aspect ratio and What It Achieved layout. */
  format?: ExportFormat;
};

function shellAspect(format?: ExportFormat) {
  if (format === "twitter") return "aspect-[16/9]";
  if (format === "linkedin-square") return "aspect-square";
  // LinkedIn Portrait + Instagram share 1080×1350 (4:5)
  return "aspect-[4/5]";
}

function formatFlags(format?: ExportFormat) {
  return {
    landscape: format === "twitter",
    square: format === "linkedin-square",
  };
}

type Theme = {
  /** Solid fallback / Stack pill contrast base */
  base: string;
  /** Full CSS background (gradient templates use a mesh). */
  canvas: string;
  text: string;
  muted: string;
  border: string;
  rule: string;
  accents: Record<SlideKind, string>;
};

const THEMES: Record<TemplateId, Theme> = {
  minimal: {
    base: "#F4F3EE",
    canvas: "#F4F3EE",
    text: "#0A0A0A",
    muted: "rgba(10,10,10,0.52)",
    border: "rgba(10,10,10,0.1)",
    rule: "rgba(10,10,10,0.12)",
    accents: {
      project: "#7C3AED",
      built: "#65A30D",
      engineering: "#DB2777",
      shipped: "#0284C7",
    },
  },
  dark: {
    base: "#0A0A0B",
    canvas: "#0A0A0B",
    text: "#F4F4F5",
    muted: "rgba(244,244,245,0.5)",
    border: "rgba(255,255,255,0.1)",
    rule: "rgba(255,255,255,0.12)",
    accents: {
      project: "#C4B5FD",
      built: "#BEF264",
      engineering: "#F9A8D4",
      shipped: "#7DD3FC",
    },
  },
  gradient: {
    base: "#1A0B2E",
    canvas:
      "linear-gradient(155deg, #2B1055 0%, #1A0B2E 28%, #0B1B3A 62%, #06201F 100%)",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.62)",
    border: "rgba(255,255,255,0.18)",
    rule: "rgba(255,255,255,0.22)",
    accents: {
      project: "#E879F9",
      built: "#A3E635",
      engineering: "#FB7185",
      shipped: "#38BDF8",
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
  const vivid = template === "gradient";

  // Dark: visible single-accent wash. Gradient: bold multi-hue bloom. Minimal: soft tint.
  const intensity = vivid ? 0.48 : light ? 0.16 : 0.32;
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

  // Second bloom uses a complementary hue on Gradient so cards feel painted, not flat.
  const secondary =
    kind === "project"
      ? "#38BDF8"
      : kind === "built"
        ? "#E879F9"
        : kind === "engineering"
          ? "#A3E635"
          : "#FB7185";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[20%] opacity-90"
        style={{
          background: vivid
            ? `
            radial-gradient(ellipse ${a.s} ${a.s} at ${a.x} ${a.y},
              ${hexAlpha(color, intensity)} 0%,
              ${hexAlpha(color, intensity * 0.4)} 32%,
              transparent 68%),
            radial-gradient(ellipse ${b.s} ${b.s} at ${b.x} ${b.y},
              ${hexAlpha(secondary, intensity * 0.7)} 0%,
              ${hexAlpha(secondary, intensity * 0.25)} 40%,
              transparent 70%),
            radial-gradient(ellipse 90% 60% at 50% 110%,
              ${hexAlpha(color, 0.22)} 0%,
              transparent 55%)
          `
            : `
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
          filter: vivid ? "blur(6px)" : "blur(2px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: light
            ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 40%, rgba(244,243,238,0.55) 100%)"
            : vivid
              ? "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%)"
              : "radial-gradient(ellipse 85% 70% at 50% 40%, transparent 50%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </>
  );
}

function Shell({
  story,
  kind,
  format,
  children,
}: {
  story: ProjectStory;
  kind: SlideKind;
  format?: ExportFormat;
  children: React.ReactNode;
}) {
  const theme = THEMES[story.template];
  const accent = theme.accents[kind];
  const { landscape, square } = formatFlags(format);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px]",
        shellAspect(format),
      )}
      style={{
        background: theme.canvas,
        color: theme.text,
        border: `1px solid ${theme.border}`,
      }}
    >
      <Atmosphere color={accent} template={story.template} kind={kind} />
      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col",
          landscape ? "px-[4%] py-[4.5%]" : square ? "px-[7%] py-[7%]" : "px-[8%] py-[8%]",
        )}
      >
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
  compact,
}: {
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle?: string;
  muted: string;
  /** Tighter type for square / landscape export formats. */
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-start", compact ? "gap-4" : "gap-5")}>
      {/* Circle height matches the first text line */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2",
          compact ? "h-[2.75rem] w-[2.75rem]" : "h-[3.3rem] w-[3.3rem]",
        )}
        style={{ borderColor: accent, color: accent }}
      >
        <Icon className={compact ? "h-[1.35rem] w-[1.35rem]" : "h-7 w-7"} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-display tracking-[-0.03em]",
            compact
              ? "text-[1.95rem] leading-[1.3]"
              : "text-[2.75rem] leading-[1.2]",
          )}
        >
          {title}
        </p>
        {subtitle ? (
          <p
            className={cn("mt-2 leading-snug", compact ? "text-[1.35rem]" : "text-[1.5rem]")}
            style={{ color: muted }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function stack(story: ProjectStory) {
  return story.technologies.length ? story.technologies : story.languages;
}

function StackPills({
  techs,
  muted,
  border,
  text,
  landscape,
}: {
  techs: string[];
  muted: string;
  border: string;
  text: string;
  landscape?: boolean;
}) {
  if (!techs.length) return null;

  return (
    <div className="space-y-3">
      <p
        className="font-mono text-[1.2rem] tracking-[0.18em] uppercase"
        style={{ color: muted }}
      >
        Stack
      </p>
      <ul className="flex flex-wrap gap-3">
        {techs.map((tech) => (
          <li
            key={tech}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl border",
              landscape ? "px-3.5 py-2" : "px-4 py-2.5",
            )}
            style={{
              borderColor: border,
              backgroundColor: hexAlpha(text, 0.06),
              color: text,
            }}
          >
            <TechGlyph
              name={tech}
              className={landscape ? "h-5 w-5 shrink-0" : "h-6 w-6 shrink-0"}
              style={{ color: muted, opacity: 0.95 }}
            />
            <span
              className={cn(
                "font-display tracking-[-0.02em]",
                landscape ? "text-[1.45rem]" : "text-[1.65rem]",
              )}
            >
              {tech}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Card 1 — Project Snapshot */
export function ProjectSlide({ story, format }: SlideProps) {
  const theme = THEMES[story.template];
  const accent = theme.accents.project;
  const title = story.customTitle || story.name;
  const tagline = story.carousel.tagline || story.description;
  const techs = stack(story);
  const proofImage = story.carousel.proofImage;
  const mediaHref = story.carousel.proofLink || story.carousel.homepage;
  const role = story.carousel.role;
  const statusLabel = story.carousel.statusLabel;
  const { landscape, square } = formatFlags(format);
  const withMedia = Boolean(proofImage);

  const header = (
    <CardHeader index="01" label="Project Snapshot" accent={accent} muted={theme.muted} />
  );

  const heading = (
    <h2
      className={cn(
        "max-w-none font-display leading-[0.88] tracking-[-0.055em] break-words",
        landscape
          ? "mt-3 text-[4.75rem]"
          : square
            ? "mt-4 text-[4.25rem]"
            : withMedia
              ? "mt-5 text-[5.75rem]"
              : "mt-8 text-[7rem]",
      )}
    >
      {title}
    </h2>
  );

  const body = (
    <>
      <p
        className={cn(
          "leading-snug",
          landscape || square ? "max-w-none" : "max-w-[44ch]",
          withMedia ? "line-clamp-5" : "line-clamp-6",
          landscape
            ? "mt-3 text-[1.65rem]"
            : square
              ? "mt-3 text-[1.55rem]"
              : withMedia
                ? "mt-4 text-[1.95rem]"
                : "mt-6 text-[2.1rem]",
        )}
        style={{ color: theme.muted }}
      >
        {tagline}
      </p>

      <div
        className={cn(
          landscape
            ? "mt-5 space-y-4"
            : square
              ? "mt-5 space-y-4"
              : withMedia
                ? "mt-5 space-y-3.5"
                : "mt-10 space-y-5",
        )}
      >
        {role || statusLabel ? (
          <div className="flex flex-wrap items-start gap-x-12 gap-y-4">
            {role ? (
              <div className="min-w-0">
                <p
                  className="font-mono text-[1.15rem] tracking-[0.18em] uppercase"
                  style={{ color: theme.muted }}
                >
                  Role
                </p>
                <p className="mt-2 font-display text-[2rem] leading-none tracking-[-0.02em]">
                  {role}
                </p>
              </div>
            ) : null}
            {statusLabel ? (
              <div className="min-w-0">
                <p
                  className="font-mono text-[1.15rem] tracking-[0.18em] uppercase"
                  style={{ color: theme.muted }}
                >
                  Status
                </p>
                <p
                  className="mt-2 font-display text-[2rem] leading-none tracking-[-0.02em]"
                  style={{ color: accent }}
                >
                  {statusLabel}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <StackPills
          techs={techs}
          muted={theme.muted}
          border={theme.border}
          text={theme.text}
          landscape={landscape}
        />
      </div>
    </>
  );

  const mediaFrame = (className: string, style: CSSProperties) => (
    <div className={cn("group relative shrink-0 overflow-hidden border", className)} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proofImage!}
        alt="Project screenshot"
        className="h-full w-full object-cover object-top"
      />
      {mediaHref ? (
        <a
          href={mediaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label="Open project demo"
        />
      ) : null}
    </div>
  );

  if (landscape && withMedia) {
    return (
      <Shell story={story} kind="project" format={format}>
        <div className="flex h-full min-h-0 flex-1 items-stretch gap-8">
          <div className="flex min-w-0 flex-[0.95] flex-col">
            {header}
            {heading}
            {body}
          </div>
          {mediaFrame("h-full min-h-0 w-[54%] self-stretch rounded-[1.5rem]", {
            borderColor: theme.border,
            backgroundColor: hexAlpha(theme.text, 0.06),
          })}
        </div>
      </Shell>
    );
  }

  return (
    <Shell story={story} kind="project" format={format}>
      {header}
      {heading}
      {body}
      {withMedia
        ? mediaFrame(
            cn(
              "mt-auto w-full rounded-2xl aspect-video",
              landscape ? "mt-4 max-w-[58%]" : "mt-6",
            ),
            {
              borderColor: theme.border,
              backgroundColor: hexAlpha(theme.text, 0.06),
            },
          )
        : null}
    </Shell>
  );
}

/** Card 2 — What I Built */
export function BuiltSlide({ story, format }: SlideProps) {
  const theme = THEMES[story.template];
  const accent = theme.accents.built;
  const features = story.carousel.features.slice(0, 4);
  const { landscape, square } = formatFlags(format);

  return (
    <Shell story={story} kind="built" format={format}>
      <CardHeader index="02" label="What I Built" accent={accent} muted={theme.muted} />

      <h2
        className={cn(
          "font-display leading-[0.9] tracking-[-0.05em]",
          landscape
            ? "mt-3 max-w-none text-[3.25rem]"
            : square
              ? "mt-4 max-w-none text-[3.5rem]"
              : "mt-8 max-w-[12ch] text-[5.5rem]",
        )}
      >
        What I actually delivered.
      </h2>

      <p
        className={cn(
          "mt-3 leading-snug",
          landscape
            ? "max-w-none text-[1.4rem]"
            : square
              ? "max-w-none text-[1.45rem]"
              : "max-w-[32ch] text-[1.65rem]",
        )}
        style={{ color: theme.muted }}
      >
        Product capabilities completed in this repository.
      </p>

      <ul
        className={cn(
          "min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          landscape
            ? "mt-5 grid grid-cols-2 content-center gap-x-10 gap-y-7"
            : cn(
                "flex flex-col justify-evenly",
                square ? "mt-5" : "mt-10",
              ),
        )}
      >
        {features.map((f, i) => (
          <li key={f.id}>
            <IconRow
              icon={FEATURE_ICONS[i % FEATURE_ICONS.length]}
              accent={accent}
              title={f.text}
              muted={theme.muted}
              compact={square || landscape}
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

/** Card 3 — How It Works */
export function EngineeringSlide({ story, format }: SlideProps) {
  const theme = THEMES[story.template];
  const accent = theme.accents.engineering;
  const flow = (story.carousel.architectureFlow ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const items = story.carousel.engineering.slice(0, 4);
  const { landscape, square } = formatFlags(format);

  return (
    <Shell story={story} kind="engineering" format={format}>
      <CardHeader index="03" label="How It Works" accent={accent} muted={theme.muted} />

      <h2
        className={cn(
          "font-display leading-[0.9] tracking-[-0.05em]",
          landscape
            ? "mt-3 max-w-none text-[3.25rem]"
            : square
              ? "mt-4 max-w-none text-[3.5rem]"
              : "mt-7 max-w-[12ch] text-[5rem]",
        )}
      >
        The important path.
      </h2>

      {flow.length ? (
        <p
          className={cn(
            "flex flex-wrap items-center font-display leading-snug tracking-[-0.02em]",
            landscape
              ? "mt-3 gap-x-5 gap-y-2 text-[1.7rem]"
              : square
                ? "mt-3 gap-x-4 gap-y-2 text-[1.55rem]"
                : "mt-6 gap-x-6 gap-y-2 text-[2.15rem]",
          )}
          style={{ color: accent }}
        >
          {flow.map((step, i) => (
            <span key={`${step}-${i}`} className="contents">
              {i > 0 ? (
                <span className="opacity-70" aria-hidden="true">
                  →
                </span>
              ) : null}
              <span>{step}</span>
            </span>
          ))}
        </p>
      ) : null}

      <ul
        className={cn(
          "min-h-0 flex-1",
          landscape
            ? "mt-4 grid grid-cols-2 content-center gap-x-10 gap-y-7"
            : cn(
                "flex flex-col justify-evenly",
                square ? "mt-4" : "mt-8 space-y-5",
              ),
        )}
      >
        {items.map((e, i) => (
          <li key={e.id}>
            <IconRow
              icon={ENG_ICONS[i % ENG_ICONS.length]}
              accent={accent}
              title={e.text}
              muted={theme.muted}
              compact={square || landscape}
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

/** Card 4 — What It Achieved */
export function ShippedSlide({ story, format }: SlideProps) {
  const theme = THEMES[story.template];
  const accent = theme.accents.shipped;
  const { landscape, square } = formatFlags(format);
  const points = story.carousel.shipped.slice(0, 4);

  return (
    <Shell story={story} kind="shipped" format={format}>
      <CardHeader
        index="04"
        label="What It Achieved"
        accent={accent}
        muted={theme.muted}
      />

      <h2
        className={cn(
          "font-display leading-[0.9] tracking-[-0.05em]",
          landscape
            ? "mt-3 max-w-none text-[3.25rem]"
            : square
              ? "mt-4 max-w-none text-[3.5rem]"
              : "mt-7 max-w-[14ch] text-[5rem]",
        )}
      >
        What this project achieved.
      </h2>

      <p
        className={cn(
          "mt-3 leading-snug",
          landscape
            ? "max-w-none text-[1.4rem]"
            : square
              ? "max-w-none text-[1.45rem]"
              : "max-w-[34ch] text-[1.65rem]",
        )}
        style={{ color: theme.muted }}
      >
        Delivery milestones — what shipped and what it unlocked.
      </p>

      <ul
        className={cn(
          "min-h-0 flex-1",
          landscape
            ? "mt-4 grid grid-cols-2 content-center gap-x-10 gap-y-7"
            : cn(
                "flex flex-col justify-evenly",
                square ? "mt-4" : "mt-7 space-y-4",
              ),
        )}
      >
        {points.map((p) => (
          <li key={p.id}>
            <IconRow
              icon={CheckCircle2}
              accent={accent}
              title={p.text}
              muted={theme.muted}
              compact={square || landscape}
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

/** @deprecated Use ProjectSlide */
export const CoverSlide = ProjectSlide;

export const SLIDE_COMPONENTS = [
  { id: "project", label: "Project", Component: ProjectSlide },
  { id: "built", label: "What I Built", Component: BuiltSlide },
  { id: "engineering", label: "How It Works", Component: EngineeringSlide },
  { id: "shipped", label: "What It Achieved", Component: ShippedSlide },
] as const;
