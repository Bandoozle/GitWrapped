import type { FieldSource, StoryItem } from "./types";
import { newStoryItem } from "./types";

const MIN_BULLETS = 3;
const MAX_BULLETS = 4;

/** Prefer recruiter-readable sentences over short noun labels. */
const MIN_CAPABILITY_CHARS = 42;
const MIN_CAPABILITY_WORDS = 6;
const MAX_CAPABILITY_CHARS = 140;

function item(text: string, source: FieldSource, basis?: string): StoryItem {
  return newStoryItem(text, source, basis ?? null);
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isSubstantial(text: string) {
  const t = text.trim();
  if (t.length < MIN_CAPABILITY_CHARS) return false;
  if (wordCount(t) < MIN_CAPABILITY_WORDS) return false;
  // Reject bare product names / two-word stubs
  if (/^[A-Z][a-zA-Z0-9]+$/.test(t)) return false;
  if (/^(fake|test|demo|wip|tmp)\b/i.test(t) && wordCount(t) <= 3) return false;
  return true;
}

/** Pull feature-ish bullets from README markdown — max 4 capabilities. */
export function featuresFromReadme(readme: string): StoryItem[] {
  const lines = readme.split(/\r?\n/);
  const features: string[] = [];
  let inFeatures = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (
      /^#{1,3}\s*(features?|what('?s| is)? (included|built)|highlights?|built with|capabilities|what i built|key features|overview)\b/i.test(
        line,
      )
    ) {
      inFeatures = true;
      continue;
    }
    if (inFeatures && /^#{1,3}\s+/.test(line)) {
      inFeatures = false;
      continue;
    }
    if (!inFeatures) continue;

    const bullet = line.match(/^[-*+]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
    if (bullet) {
      const text = toCapability(cleanFeature(bullet[1]), { preferKeep: true });
      if (text) features.push(text);
    }
    if (features.length >= 6) break;
  }

  // Also harvest strong bullets anywhere near the top of the README
  if (features.length < 4) {
    for (const raw of lines.slice(0, 120)) {
      const line = raw.trim();
      const bullet = line.match(/^[-*+]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
      if (!bullet) continue;
      const cleaned = cleanFeature(bullet[1]);
      if (cleaned.length < 24) continue;
      if (!/\b(build|built|create|created|add|added|support|supports|enable|enables|allow|allows|provide|provides|generate|import|export|auth|login|dashboard|api|user|users)\b/i.test(cleaned)) {
        continue;
      }
      const text = toCapability(cleaned, { preferKeep: true });
      if (text) features.push(text);
      if (features.length >= 6) break;
    }
  }

  return uniqueTexts(features)
    .filter(isSubstantial)
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
    const feat = first.match(/^feat(\([^)]+\))?:\s*(.+)$/i);
    if (feat) {
      const text = toCapability(cleanFeature(feat[2]), { fromCommit: true });
      if (text) capabilities.push(text);
      continue;
    }

    const conventional = first.match(
      /^(fix|chore|docs|refactor|style|test|build|ci)(\([^)]+\))?:\s*(.+)$/i,
    );
    if (conventional && /^(fix|refactor|build)$/i.test(conventional[1]!)) {
      continue;
    }

    const cleaned = first
      .replace(/^(fix|chore|docs|refactor|style|test|build|ci)(\([^)]+\))?:\s*/i, "")
      .trim();
    if (
      cleaned.length > 18 &&
      cleaned.length < 120 &&
      !/merge (pull request|branch)|wip\b|^tmp\b/i.test(cleaned)
    ) {
      const text = toCapability(cleanFeature(cleaned), { fromCommit: true });
      if (text) capabilities.push(text);
    }
  }

  return uniqueTexts(capabilities)
    .filter(isSubstantial)
    .slice(0, 4)
    .map((t) => item(t, "suggested", "Commit history"));
}

/** Fallback capabilities inferred from description, stack, and repo layout. */
export function featuresFromContext(input: {
  description: string;
  name: string;
  technologies: string[];
  tree: TreePath[];
  packageJson: string;
  readme: string;
}): StoryItem[] {
  const out: string[] = [];
  const desc = input.description.trim();
  const lower = `${desc} ${input.readme.slice(0, 2500)} ${input.packageJson}`.toLowerCase();
  const paths = input.tree.map((t) => t.path).join("\n").toLowerCase();
  const stack = input.technologies.slice(0, 3).join(", ");

  if (desc.length >= 40) {
    const asCapability = toCapability(desc, { preferKeep: true, fromDescription: true });
    if (asCapability) out.push(asCapability);
  }

  if (/auth|login|session|oauth|next-auth|clerk|supabase/.test(lower + paths)) {
    out.push(
      "Sign-in flow that authenticates users and routes them into the main product experience",
    );
  }
  if (/dashboard|admin|panel/.test(lower + paths)) {
    out.push("Dashboard views that surface the core workflows after users sign in");
  }
  if (/api|route|fastapi|express|flask|django/.test(lower + paths)) {
    out.push(
      stack
        ? `Backend API layer using ${stack} to power the product’s main actions`
        : "Backend API layer that powers the product’s main create and read workflows",
    );
  }
  if (/upload|image|media|screenshot|file/.test(lower + paths)) {
    out.push("Media upload and display so projects can show visual proof alongside the story");
  }
  if (/map|geo|location|leaflet|mapbox/.test(lower + paths) || /map/i.test(input.name)) {
    out.push("Interactive map experience for exploring and comparing location-based data");
  }
  if (/ai|llm|openai|gemini|chat|assistant|model/.test(lower)) {
    out.push("AI-assisted workflow that turns raw input into structured, useful output");
  }
  if (/test|vitest|jest|playwright|cypress/.test(paths + lower)) {
    out.push("Automated checks that protect the main user paths as the product evolves");
  }
  if (out.length < 2 && stack) {
    out.push(`End-to-end ${input.name} experience built with ${stack}`);
  }

  return uniqueTexts(out)
    .filter(isSubstantial)
    .slice(0, 4)
    .map((t) => item(t, "suggested", "Repo description & structure"));
}

/**
 * Merge README + commits + context into 3–4 substantial capabilities.
 * Prefers detected README lines, then commits, then structural fallbacks.
 */
export function buildFeatures(input: {
  readme: string;
  commitMessages: string[];
  description: string;
  name: string;
  technologies: string[];
  tree: TreePath[];
  packageJson: string;
}): StoryItem[] {
  const fromReadme = featuresFromReadme(input.readme);
  const fromCommits = featuresFromCommits(input.commitMessages);
  const fromContext = featuresFromContext(input);
  const project = input.name.trim() || "this project";
  const stack = input.technologies.slice(0, 2).join(" and ");

  const fillers: StoryItem[] = [
    item(
      `Core ${project} workflows implemented as a connected product experience${stack ? ` using ${stack}` : ""}`,
      "suggested",
      "Project context",
    ),
    item(
      "User-facing screens that make the main product actions clear and reachable",
      "suggested",
      "Project context",
    ),
    item(
      "Data and interaction paths wired so the product can be demoed end to end",
      "suggested",
      "Project context",
    ),
  ];

  const merged = uniqueItems([
    ...fromReadme,
    ...fromCommits,
    ...fromContext,
    ...fillers,
  ]).filter((f) => isSubstantial(f.text));

  return ensureMinBullets(merged, fillers).slice(0, MAX_BULLETS);
}

function ensureMinBullets(items: StoryItem[], fillers: StoryItem[]): StoryItem[] {
  const out = uniqueItems(items);
  for (const filler of fillers) {
    if (out.length >= MIN_BULLETS) break;
    if (out.some((i) => i.text.toLowerCase() === filler.text.toLowerCase())) continue;
    out.push(filler);
  }
  while (out.length < MIN_BULLETS) {
    out.push(
      item(
        `Additional product capability delivered as part of the working prototype (${out.length + 1})`,
        "suggested",
        "Fallback",
      ),
    );
  }
  return out;
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
    label: "Asynchronous processing pipeline for background and realtime work",
    test: ({ packageJson, lowerPaths }) =>
      /async|queue|worker|pipeline|stream|websocket|realtime/.test(
        `${packageJson} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Automated CI deployment workflow for consistent releases",
    test: ({ lowerPaths }) => lowerPaths.includes(".github/workflows/"),
  },
  {
    label: "Containerized local and deploy infrastructure with Docker",
    test: ({ paths, lowerPaths }) =>
      paths.has("Dockerfile") ||
      paths.has("dockerfile") ||
      lowerPaths.includes("docker-compose"),
  },
  {
    label: "Versioned database migrations for safe schema changes",
    test: ({ lowerPaths }) =>
      /prisma\/migrations|supabase\/migrations|drizzle|alembic|flyway|liquibase/.test(
        lowerPaths,
      ),
  },
  {
    label: "Server-side authentication with session or token-based access control",
    test: ({ packageJson, lowerPaths, readme }) =>
      /next-auth|@auth\/|clerk|supabase\/auth|lucia|passport|firebase-admin/.test(
        packageJson + lowerPaths + readme.toLowerCase(),
      ) || /\/auth\b|middleware\.(ts|js)/.test(lowerPaths),
  },
  {
    label: "Role-based access control for protected product areas",
    test: ({ lowerPaths, readme, packageJson }) =>
      /rbac|role.?based|permissions|casl|clerk.*organiz/.test(
        `${lowerPaths} ${readme} ${packageJson}`.toLowerCase(),
      ),
  },
  {
    label: "Typed API routes and service handlers for the core product actions",
    test: ({ lowerPaths }) =>
      /\/(api|routes|controllers|handlers|services)\//.test(lowerPaths) ||
      /app\/api\//.test(lowerPaths) ||
      /pages\/api\//.test(lowerPaths),
  },
  {
    label: "Automated test suite covering critical application paths",
    test: ({ lowerPaths, packageJson }) =>
      /(__tests__|\.test\.|\.spec\.|\/tests\/|vitest|jest|playwright|cypress)/.test(
        lowerPaths + packageJson,
      ),
  },
  {
    label: "Python service connected to a JavaScript frontend through a clear API bridge",
    test: ({ lowerPaths, paths }) => {
      const hasPy = [...paths].some((p) => /\.py$/.test(p) || p.includes("requirements"));
      const hasJs = [...paths].some((p) =>
        /\.(tsx?|jsx?)$/.test(p) || p.includes("package.json"),
      );
      return hasPy && hasJs;
    },
  },
  {
    label: "Input validation and fallback handling for empty or failed responses",
    test: ({ lowerPaths, readme }) =>
      /fallback|error.?handl|empty.?response|guard|zod|validation/.test(
        `${lowerPaths} ${readme}`.toLowerCase(),
      ),
  },
  {
    label: "Realtime subscriptions that keep the UI in sync with live data",
    test: ({ packageJson, lowerPaths }) =>
      /realtime|websocket|socket\.io|pusher|ably|supabase.*channel/.test(
        `${packageJson} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Reusable component architecture shared across product screens",
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
    if (found.length >= MAX_BULLETS) break;
  }

  const fillers = [
    item(
      "Clear application structure that separates UI, data, and product workflows",
      "suggested",
      "Directory layout",
    ),
    item(
      "Iterative delivery visible in the development history of the repository",
      "suggested",
      "Commit history",
    ),
    item(
      "Practical engineering choices that keep the product maintainable as it grows",
      "suggested",
      "Repo structure",
    ),
  ];

  return ensureMinBullets(found, fillers).slice(0, MAX_BULLETS);
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
  if (/auth|login|session/.test(lower) && /api|route|dashboard/.test(lower)) {
    return ["Sign in", "Auth check", "Dashboard", "API / data", "User response"];
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
  name?: string;
}): StoryItem[] {
  const points: StoryItem[] = [];
  const project = input.name?.trim() || "the product";

  if (input.homepage) {
    points.push(
      item(
        `Live demo available so reviewers can walk through ${project} end to end`,
        "detected",
        "Homepage URL",
      ),
    );
  }
  if (input.featureCount >= 2) {
    points.push(
      item(
        "Core product workflows are implemented and usable as a connected experience",
        "suggested",
        "Feature summary",
      ),
    );
  }
  if (input.hasWorkflows || input.hasTests) {
    points.push(
      item(
        "Quality gates (tests and/or CI) are in place to support ongoing delivery",
        "detected",
        "CI / test files",
      ),
    );
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
        when
          ? `Published ${input.latestRelease} in ${when} as a concrete delivery milestone`
          : `Published ${input.latestRelease} as a concrete delivery milestone`,
        "detected",
        "GitHub Releases",
      ),
    );
  } else if (input.pushedAt) {
    const d = new Date(input.pushedAt);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    points.push(
      item(
        `Active prototype with continued delivery through ${label}`,
        "detected",
        "Push history",
      ),
    );
  }

  if (!points.length) {
    points.push(
      item(
        "Clear delivery path from idea to working software in this repository",
        "suggested",
      ),
    );
  }

  const fillers = [
    item(
      "Core product workflows are implemented and usable as a connected experience",
      "suggested",
      "Feature summary",
    ),
    item(
      "Repository shows a practical path from prototype to shareable delivery",
      "suggested",
      "Delivery framing",
    ),
    item(
      "Project milestones are captured so reviewers can see what actually shipped",
      "suggested",
      "Delivery framing",
    ),
  ];

  return ensureMinBullets(points, fillers).slice(0, MAX_BULLETS);
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

type CapabilityOpts = {
  preferKeep?: boolean;
  fromCommit?: boolean;
  fromDescription?: boolean;
};

/** Turn implementation-ish phrases into recruiter-readable capabilities. */
function toCapability(text: string, opts: CapabilityOpts = {}): string {
  let t = text.trim();
  if (!t) return "";

  const rewrites: [RegExp, string][] = [
    [
      /get output from python to placeholder text/i,
      "Connected Python-generated responses into the frontend UI",
    ],
    [
      /wire(d|up)?\s+(the\s+)?(frontend|ui).*(api|backend|python)/i,
      "Connected the frontend UI to the backend service for live responses",
    ],
    [
      /^(add(ed)?|implement(ed)?|create(d)?|build|built)\s+(auth|authentication|login)\b/i,
      "Authentication and session handling so users can sign in securely",
    ],
    [
      /\blogin (start )?page.*(dashboard|home)/i,
      "Login start page that signs users in and routes them to the dashboard",
    ],
    [
      /\b(fake|test)\s+users?\b/i,
      "Support for sample/test users so flows can be demoed without real accounts",
    ],
    [/fix(ed)?\s+bug/i, ""],
    [/^(wip|todo|temp|tmp)\b/i, ""],
  ];

  for (const [re, replacement] of rewrites) {
    if (re.test(t)) {
      if (!replacement) return "";
      t = t.replace(re, replacement);
    }
  }

  // Expand known short stubs before stripping verbs
  const stubExpansions: [RegExp, string][] = [
    [/^matchmap$/i, "MatchMap experience for exploring and comparing mapped data"],
    [/^login integration$/i, "Login integration that connects authentication to the main app flow"],
    [/^fake users$/i, "Support for sample/test users during development and demos"],
    [/^auth$/i, "Authentication flow that protects product screens and user sessions"],
    [/^dashboard$/i, "Dashboard that presents the main product workflows after sign-in"],
  ];
  for (const [re, expansion] of stubExpansions) {
    if (re.test(t)) {
      t = expansion;
      break;
    }
  }

  if (opts.fromCommit && !/^(built|shipped|added|implemented|delivered|created|connected|integrated)/i.test(t)) {
    t = t
      .replace(/^(add|added|implement|implemented|create|created|build|built|feat:?)\s+/i, "")
      .trim();
    if (t) t = `Built ${t} as part of the core product experience`;
  } else if (!opts.preferKeep && !opts.fromDescription) {
    t = t
      .replace(/^(add|added|implement|implemented|create|created|build|built)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  t = t.replace(/\s+/g, " ").trim().replace(/\.$/, "");

  if (opts.fromDescription && !/^(a |an |the )/i.test(t) && t.length > 20) {
    // Description is already a pitch — frame as what the product delivers
    if (!/^(turn|help|let|enable|provide|build|deliver)/i.test(t)) {
      t = `Delivers ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    }
  }

  // Last-chance expansion for still-short phrases
  if (t && !isSubstantial(t)) {
    if (wordCount(t) <= 4 && t.length >= 4) {
      t = `Shipped ${t} as a usable part of the product workflow`;
    }
  }

  if (!isSubstantial(t)) return "";
  if (t.length > MAX_CAPABILITY_CHARS) {
    t = `${t.slice(0, MAX_CAPABILITY_CHARS - 1).replace(/\s+\S*$/, "")}…`;
  }
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

function uniqueItems(items: StoryItem[]) {
  const seen = new Set<string>();
  const out: StoryItem[] = [];
  for (const it of items) {
    const key = it.text.toLowerCase();
    if (!it.text || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function titleCase(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
