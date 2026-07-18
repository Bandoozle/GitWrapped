import type { FieldSource, StoryItem } from "./types";
import { newStoryItem } from "./types";

function item(text: string, source: FieldSource, basis?: string): StoryItem {
  return newStoryItem(text, source, basis ?? null);
}

/** Pull feature-ish bullets from README markdown — max 4 capabilities. */
export function featuresFromReadme(readme: string): StoryItem[] {
  const lines = readme.split(/\r?\n/);
  const features: string[] = [];
  let inFeatures = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (
      /^#{1,3}\s*(features?|what('?s| is)? (included|built)|built with|capabilities|what i built)\b/i.test(
        line,
      )
    ) {
      inFeatures = true;
      continue;
    }
    if (inFeatures && /^#{1,3}\s+/.test(line)) break;
    if (!inFeatures) continue;

    const bullet = line.match(/^[-*+]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
    if (bullet) {
      const text = toCapability(cleanFeature(bullet[1]));
      if (text) features.push(text);
    }
    if (features.length >= 4) break;
  }

  return uniqueTexts(features)
    .slice(0, 4)
    .map((t) => item(t, "detected", "README feature section"));
}

/**
 * Translate commit history into completed capabilities.
 * Never surfaces raw commit messages on the card.
 */
export function featuresFromCommits(messages: string[]): StoryItem[] {
  const capabilities: string[] = [];

  for (const message of messages) {
    const first = message.split("\n")[0].trim();
    const feat = first.match(/^feat(\(.+\))?:\s*(.+)$/i);
    if (feat) {
      const text = toCapability(cleanFeature(feat[2]));
      if (text) capabilities.push(text);
      continue;
    }
    const cleaned = first
      .replace(/^(fix|chore|docs|refactor|style|test|build|ci)(\(.+\))?:\s*/i, "")
      .trim();
    if (
      cleaned.length > 12 &&
      cleaned.length < 90 &&
      !/merge (pull request|branch)|wip\b|^tmp\b/i.test(cleaned)
    ) {
      const text = toCapability(cleanFeature(cleaned));
      if (text) capabilities.push(text);
    }
  }

  return uniqueTexts(capabilities)
    .slice(0, 4)
    .map((t) => item(t, "suggested", "Commit clusters"));
}

type TreePath = { path: string; type: string };

const ENGINEERING_RULES: {
  label: string;
  test: (ctx: {
    paths: Set<string>;
    lowerPaths: string;
    packageJson: string;
    readme: string;
  }) => boolean;
}[] = [
  {
    label: "Asynchronous processing pipeline",
    test: ({ packageJson, lowerPaths }) =>
      /async|queue|worker|pipeline|stream|websocket|realtime/.test(
        `${packageJson} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Automated deployment workflow",
    test: ({ lowerPaths }) => lowerPaths.includes(".github/workflows/"),
  },
  {
    label: "Containerized infrastructure",
    test: ({ paths, lowerPaths }) =>
      paths.has("Dockerfile") ||
      paths.has("dockerfile") ||
      lowerPaths.includes("docker-compose"),
  },
  {
    label: "Database migrations",
    test: ({ lowerPaths }) =>
      /prisma\/migrations|supabase\/migrations|drizzle|alembic|flyway|liquibase/.test(
        lowerPaths,
      ),
  },
  {
    label: "Server-side authentication",
    test: ({ packageJson, lowerPaths, readme }) =>
      /next-auth|@auth\/|clerk|supabase\/auth|lucia|passport|firebase-admin/.test(
        packageJson + lowerPaths + readme.toLowerCase(),
      ) || /\/auth\b|middleware\.(ts|js)/.test(lowerPaths),
  },
  {
    label: "Role-based access control",
    test: ({ lowerPaths, readme, packageJson }) =>
      /rbac|role.?based|permissions|casl|clerk.*organiz/.test(
        `${lowerPaths} ${readme} ${packageJson}`.toLowerCase(),
      ),
  },
  {
    label: "API routes & service handlers",
    test: ({ lowerPaths }) =>
      /\/(api|routes|controllers|handlers|services)\//.test(lowerPaths) ||
      /app\/api\//.test(lowerPaths) ||
      /pages\/api\//.test(lowerPaths),
  },
  {
    label: "Automated test suite",
    test: ({ lowerPaths, packageJson }) =>
      /(__tests__|\.test\.|\.spec\.|\/tests\/|vitest|jest|playwright|cypress)/.test(
        lowerPaths + packageJson,
      ),
  },
  {
    label: "Python service connected to a JavaScript interface",
    test: ({ lowerPaths, paths }) => {
      const hasPy = [...paths].some((p) => /\.py$/.test(p) || p.includes("requirements"));
      const hasJs = [...paths].some((p) =>
        /\.(tsx?|jsx?)$/.test(p) || p.includes("package.json"),
      );
      return hasPy && hasJs;
    },
  },
  {
    label: "Structured handling for empty or failed model output",
    test: ({ lowerPaths, readme }) =>
      /fallback|error.?handl|empty.?response|guard|zod|validation/.test(
        `${lowerPaths} ${readme}`.toLowerCase(),
      ),
  },
  {
    label: "Realtime subscriptions",
    test: ({ packageJson, lowerPaths }) =>
      /realtime|websocket|socket\.io|pusher|ably|supabase.*channel/.test(
        `${packageJson} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Reusable component architecture",
    test: ({ lowerPaths }) =>
      /\/(components|ui|shared)\//.test(lowerPaths) &&
      (lowerPaths.match(/\/components\//g)?.length ?? 0) >= 3,
  },
];

export function detectEngineering(input: {
  tree: TreePath[];
  packageJson: string;
  readme: string;
}): StoryItem[] {
  const paths = new Set(input.tree.map((t) => t.path));
  const lowerPaths = [...paths].join("\n").toLowerCase();
  const ctx = {
    paths,
    lowerPaths,
    packageJson: input.packageJson.toLowerCase(),
    readme: input.readme,
  };

  const found: StoryItem[] = [];
  for (const rule of ENGINEERING_RULES) {
    if (rule.test(ctx)) {
      found.push(item(rule.label, "detected", "Repo structure & dependencies"));
    }
    if (found.length >= 4) break;
  }

  if (!found.length) {
    return [
      item("Clear application structure", "suggested", "Directory layout"),
      item("Iterative delivery from development history", "suggested", "Commit history"),
    ];
  }

  return found;
}

/** Small architecture flow for How It Works — 3–5 steps. */
export function buildArchitectureFlow(input: {
  tree: TreePath[];
  packageJson: string;
  readme: string;
  technologies: string[];
}): string[] {
  const lower = `${input.packageJson} ${input.readme} ${input.tree.map((t) => t.path).join(" ")}`.toLowerCase();
  const tech = input.technologies.map((t) => t.toLowerCase()).join(" ");

  if (/meet|transcript|gemini|openai|llm|chat|assistant/.test(lower + tech)) {
    return [
      "Live transcript",
      "Relevance filter",
      "AI processing",
      "Structured response",
      "Meeting interface",
    ];
  }
  if (/auth|login|session/.test(lower) && /api|route/.test(lower)) {
    return ["User request", "Auth check", "API / service", "Data store", "UI response"];
  }
  if (/next|react|vue|svelte/.test(tech + lower) && /api|server|supabase|firebase/.test(lower + tech)) {
    return ["Client UI", "Server handlers", "Data layer", "External services"];
  }
  if (/\.py\b|fastapi|flask|django/.test(lower) && /\.tsx?|\.jsx?|react|vue/.test(lower)) {
    return ["Frontend", "API bridge", "Python service", "Model / data", "UI update"];
  }

  return ["Input", "Processing", "Storage", "Output"];
}

/** Evidence chips — only claims the repo can support. */
export function buildEvidence(input: {
  tree: TreePath[];
  packageJson: string;
  hasWorkflows: boolean;
  hasTests: boolean;
  contributors: number;
  hasApi: boolean;
}): string[] {
  const chips: string[] = [];
  if (input.hasTests) chips.push("Tests detected");
  if (input.hasWorkflows) chips.push("CI configured");
  if (input.hasApi) chips.push("API integration");
  if (input.contributors > 1) {
    chips.push(`${input.contributors} contributors`);
  } else if (input.contributors === 1) {
    chips.push("Solo-built");
  }
  const lower = input.tree.map((t) => t.path).join("\n").toLowerCase();
  if (/dockerfile|docker-compose/.test(lower)) chips.push("Docker present");
  return chips.slice(0, 4);
}

export function buildShippedPoints(input: {
  homepage: string | null;
  latestRelease: string | null;
  hasWorkflows: boolean;
  hasTests: boolean;
  pushedAt: string | null;
  featureCount: number;
  releasePublishedAt?: string | null;
}): StoryItem[] {
  const points: StoryItem[] = [];

  if (input.homepage) {
    points.push(item("Live demo available for an end-to-end walkthrough", "detected", "Homepage URL"));
  }
  if (input.featureCount >= 2) {
    points.push(item("Core product workflows shipped end-to-end", "suggested", "Feature summary"));
  }
  if (input.hasWorkflows || input.hasTests) {
    points.push(item("Quality gates in place for ongoing delivery", "detected", "CI / test files"));
  }
  if (input.latestRelease) {
    const when = input.releasePublishedAt
      ? new Date(input.releasePublishedAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : null;
    points.push(
      item(
        when ? `Shipped ${input.latestRelease} · ${when}` : `Shipped ${input.latestRelease}`,
        "detected",
        "GitHub Releases",
      ),
    );
  } else if (input.pushedAt) {
    // Prefer soft "released" framing over abandoned-looking "last updated"
    const d = new Date(input.pushedAt);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    points.push(item(`Active prototype · Progress through ${label}`, "detected", "Push history"));
  }

  if (!points.length) {
    points.push(item("Clear delivery path from idea to working software", "suggested"));
  }

  return points.slice(0, 4);
}

export function buildPeriodLabel(input: {
  latestRelease: string | null;
  releasePublishedAt: string | null;
  homepage: string | null;
  activityStatus: string;
}): string {
  if (input.latestRelease && input.releasePublishedAt) {
    const when = new Date(input.releasePublishedAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return `Released ${when}`;
  }
  if (input.latestRelease) return `Latest release ${input.latestRelease}`;
  if (input.homepage) return "Stable prototype · Live demo available";
  if (input.activityStatus === "active") return "Working prototype";
  return "Stable prototype";
}

/** Turn implementation-ish phrases into recruiter-readable capabilities. */
function toCapability(text: string): string {
  let t = text.trim();
  if (!t) return "";

  const rewrites: [RegExp, string][] = [
    [/get output from python to placeholder text/i, "Connected Python-generated responses to the frontend"],
    [/wire(d|up)?\s+(the\s+)?(frontend|ui).*(api|backend|python)/i, "Connected the frontend to the backend service"],
    [/add(ed)?\s+auth/i, "Authentication and session handling"],
    [/fix(ed)?\s+bug/i, ""],
    [/wip|todo|temp|tmp/i, ""],
    [/^(update|updates?|change|changes?|tweak|tweaks?)\s+/i, ""],
  ];

  for (const [re, replacement] of rewrites) {
    if (re.test(t)) {
      if (!replacement) return "";
      t = t.replace(re, replacement);
    }
  }

  // Soften raw imperative commit tone into a capability noun phrase when short
  t = t
    .replace(/^(add|added|implement|implemented|create|created|build|built)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (t.length < 8) return "";
  return titleCase(t);
}

function cleanFeature(text: string) {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");
}

function uniqueTexts(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (!v || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function titleCase(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
