import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siCss,
  siDjango,
  siDocker,
  siDotnet,
  siExpress,
  siFastapi,
  siFirebase,
  siFlask,
  siFramer,
  siGo,
  siGooglegemini,
  siGraphql,
  siHtml5,
  siJavascript,
  siKotlin,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siRust,
  siSelenium,
  siSupabase,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
} from "simple-icons";

type TechVisual = {
  label: string;
  /** SVG path for a 24×24 simple-icons glyph, or null for initials fallback. */
  path: string | null;
};

const ALIASES: Record<string, SimpleIcon> = {
  python: siPython,
  javascript: siJavascript,
  js: siJavascript,
  typescript: siTypescript,
  ts: siTypescript,
  html: siHtml5,
  html5: siHtml5,
  css: siCss,
  css3: siCss,
  react: siReact,
  "react.js": siReact,
  "next.js": siNextdotjs,
  nextjs: siNextdotjs,
  next: siNextdotjs,
  node: siNodedotjs,
  "node.js": siNodedotjs,
  nodejs: siNodedotjs,
  vue: siVuedotjs,
  "vue.js": siVuedotjs,
  svelte: siSvelte,
  go: siGo,
  golang: siGo,
  rust: siRust,
  docker: siDocker,
  postgres: siPostgresql,
  postgresql: siPostgresql,
  mongodb: siMongodb,
  mongo: siMongodb,
  graphql: siGraphql,
  prisma: siPrisma,
  supabase: siSupabase,
  firebase: siFirebase,
  tailwind: siTailwindcss,
  "tailwind css": siTailwindcss,
  "tailwindcss": siTailwindcss,
  express: siExpress,
  fastapi: siFastapi,
  flask: siFlask,
  django: siDjango,
  selenium: siSelenium,
  "framer motion": siFramer,
  framer: siFramer,
  kotlin: siKotlin,
  swift: siSwift,
  "c#": siDotnet,
  csharp: siDotnet,
  ".net": siDotnet,
  dotnet: siDotnet,
  gemini: siGooglegemini,
  "gemini api": siGooglegemini,
  "google gemini": siGooglegemini,
};

function normalizeKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function initials(name: string) {
  const parts = name.trim().split(/[\s./]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

/** Resolve a technology name to a display label + optional SVG path. */
export function resolveTechVisual(name: string): TechVisual {
  const key = normalizeKey(name);
  const icon = ALIASES[key];
  if (icon) {
    return { label: name.trim(), path: icon.path };
  }
  return { label: name.trim(), path: null };
}

export function TechGlyph({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const visual = resolveTechVisual(name);
  if (visual.path) {
    return (
      <svg
        role="img"
        aria-hidden
        viewBox="0 0 24 24"
        className={className}
        style={style}
      >
        <path d={visual.path} fill="currentColor" />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className={className}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.55em",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {initials(visual.label)}
    </span>
  );
}
