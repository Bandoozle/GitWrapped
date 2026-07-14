import type { FieldSource, StoryItem } from "./types";
import { newStoryItem } from "./types";

function item(text: string, source: FieldSource): StoryItem {
  return newStoryItem(text, source);
}

/** Pull feature-ish bullets from README markdown. */
export function featuresFromReadme(readme: string): StoryItem[] {
  const lines = readme.split(/\r?\n/);
  const features: string[] = [];
  let inFeatures = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (/^#{1,3}\s*(features?|what('?s| is)? (included|built)|built with|capabilities)\b/i.test(line)) {
      inFeatures = true;
      continue;
    }
    if (inFeatures && /^#{1,3}\s+/.test(line)) break;
    if (!inFeatures) continue;

    const bullet = line.match(/^[-*+]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
    if (bullet) {
      const text = cleanFeature(bullet[1]);
      if (text) features.push(text);
    }
    if (features.length >= 8) break;
  }

  return uniqueTexts(features).map((t) => item(t, "detected"));
}

/** Prefer conventional `feat:` commits; fall back to distinctive titles. */
export function featuresFromCommits(messages: string[]): StoryItem[] {
  const feats: string[] = [];
  const other: string[] = [];

  for (const message of messages) {
    const first = message.split("\n")[0].trim();
    const feat = first.match(/^feat(\(.+\))?:\s*(.+)$/i);
    if (feat) {
      const text = cleanFeature(feat[2]);
      if (text) feats.push(text);
      continue;
    }
    const cleaned = first
      .replace(/^(fix|chore|docs|refactor|style|test|build|ci)(\(.+\))?:\s*/i, "")
      .trim();
    if (cleaned.length > 12 && cleaned.length < 72 && !/merge pull request/i.test(cleaned)) {
      other.push(cleanFeature(cleaned));
    }
  }

  const picked = uniqueTexts(feats.length ? feats : other).slice(0, 8);
  return picked.map((t) => item(titleCase(t), feats.length ? "detected" : "suggested"));
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
    label: "Row-level database security",
    test: ({ lowerPaths, readme }) =>
      /row.?level|rls\b|policies\.sql/.test(`${lowerPaths} ${readme}`.toLowerCase()),
  },
  {
    label: "API routes & server handlers",
    test: ({ lowerPaths }) =>
      /\/(api|routes|controllers|handlers)\//.test(lowerPaths) ||
      /app\/api\//.test(lowerPaths) ||
      /pages\/api\//.test(lowerPaths),
  },
  {
    label: "Automated tests",
    test: ({ lowerPaths, packageJson }) =>
      /(__tests__|\.test\.|\.spec\.|\/tests\/|vitest|jest|playwright|cypress)/.test(
        lowerPaths + packageJson,
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
    label: "Background jobs & queues",
    test: ({ packageJson, lowerPaths }) =>
      /bull|inngest|trigger\.dev|sidekiq|celery|worker|cron/.test(
        `${packageJson} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Caching layer",
    test: ({ packageJson, lowerPaths }) =>
      /redis|upstash|isr|revalidate|cache/.test(`${packageJson} ${lowerPaths}`.toLowerCase()),
  },
  {
    label: "Reusable component architecture",
    test: ({ lowerPaths }) =>
      /\/(components|ui|shared)\//.test(lowerPaths) &&
      (lowerPaths.match(/\/components\//g)?.length ?? 0) >= 3,
  },
  {
    label: "Infrastructure as configuration",
    test: ({ paths, lowerPaths }) =>
      paths.has("vercel.json") ||
      paths.has("netlify.toml") ||
      lowerPaths.includes("terraform") ||
      lowerPaths.includes(".github/"),
  },
  {
    label: "Accessibility considerations",
    test: ({ packageJson, readme, lowerPaths }) =>
      /a11y|aria-|eslint-plugin-jsx-a11y|accessible/.test(
        `${packageJson} ${readme} ${lowerPaths}`.toLowerCase(),
      ),
  },
  {
    label: "Responsive application shell",
    test: ({ packageJson, readme, lowerPaths }) =>
      /tailwind|responsive|mobile.?first|media.?quer/.test(
        `${packageJson} ${readme} ${lowerPaths}`.toLowerCase(),
      ),
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
    if (rule.test(ctx)) found.push(item(rule.label, "detected"));
    if (found.length >= 6) break;
  }

  if (!found.length) {
    return [
      item("Clear project structure", "suggested"),
      item("Iterative delivery from commit history", "suggested"),
    ];
  }

  return found;
}

export function buildShippedPoints(input: {
  homepage: string | null;
  latestRelease: string | null;
  hasWorkflows: boolean;
  hasTests: boolean;
  pushedAt: string | null;
  featureCount: number;
}): StoryItem[] {
  const points: StoryItem[] = [];

  if (input.homepage) {
    points.push(item("Live demo available", "detected"));
  }
  if (input.latestRelease) {
    points.push(item(`Latest release: ${input.latestRelease}`, "detected"));
  }
  if (input.hasWorkflows) {
    points.push(item("Automated checks configured", "detected"));
  }
  if (input.hasTests) {
    points.push(item("Test suite present", "detected"));
  }
  if (input.featureCount >= 3) {
    points.push(item("Core workflows implemented", "suggested"));
  }
  if (input.pushedAt) {
    const d = new Date(input.pushedAt);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    points.push(item(`Last meaningful update: ${label}`, "detected"));
  }

  if (!points.length) {
    points.push(item("Repository documented and actively maintained", "suggested"));
  }

  return points.slice(0, 5);
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
