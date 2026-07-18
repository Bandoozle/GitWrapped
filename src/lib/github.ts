import type { ActivityStatus, ProjectStory, RepoOption, StoryLink } from "./types";
import { defaultStatusLabel } from "./types";
import { detectTechnologies } from "./tech-detect";
import {
  buildArchitectureFlow,
  buildEvidence,
  buildPeriodLabel,
  buildShippedPoints,
  detectEngineering,
  featuresFromCommits,
  featuresFromReadme,
} from "./github-signals";

const GITHUB_API = "https://api.github.com";

/** Languages that are usually supporting metadata, not the project story. */
const SUPPORT_ONLY_LANGS = new Set([
  "html",
  "css",
  "scss",
  "less",
  "batchfile",
  "shell",
  "makefile",
  "dockerfile",
  "procfile",
  "powershell",
]);


type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string | null;
  created_at: string;
  html_url: string;
  homepage: string | null;
  archived: boolean;
  topics?: string[];
  default_branch: string;
  owner: { login: string };
  private: boolean;
};

type GhCommit = {
  sha: string;
  commit: {
    message: string;
    author: { date: string } | null;
    committer: { date: string } | null;
  };
};

type GhRelease = {
  tag_name: string;
  name: string | null;
  published_at: string | null;
};

type GhTree = {
  tree: { path: string; type: string }[];
  truncated: boolean;
};

type GhContent = {
  content?: string;
  encoding?: string;
};

async function gh<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "gitwrapped-app",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

async function ghOptional<T>(path: string, token?: string): Promise<T | null> {
  try {
    return await gh<T>(path, token);
  } catch {
    return null;
  }
}

export async function listUserRepos(token: string): Promise<RepoOption[]> {
  const pages: GhRepo[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await gh<GhRepo[]>(
      `/user/repos?sort=updated&per_page=100&page=${page}&affiliation=owner,collaborator`,
      token,
    );
    pages.push(...batch);
    if (batch.length < 100) break;
  }

  return pages.map((repo) => ({
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "No description",
    language: repo.language || "Unknown",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    private: repo.private,
    htmlUrl: repo.html_url,
  }));
}

export async function importRepoStory(
  fullName: string,
  token: string,
): Promise<ProjectStory> {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repository");

  const [meta, languages, commits, contributors, releases, readmeRaw] = await Promise.all([
    gh<GhRepo>(`/repos/${owner}/${repo}`, token),
    gh<Record<string, number>>(`/repos/${owner}/${repo}/languages`, token),
    fetchCommits(owner, repo, token),
    gh<{ login: string }[]>(`/repos/${owner}/${repo}/contributors?per_page=10`, token).catch(
      () => [],
    ),
    gh<GhRelease[]>(`/repos/${owner}/${repo}/releases?per_page=5`, token).catch(() => []),
    fetchReadme(owner, repo, token),
  ]);

  const [tree, packageJson] = await Promise.all([
    fetchTree(owner, repo, meta.default_branch, token),
    fetchPackageJson(owner, repo, token),
  ]);

  const languageNames = Object.keys(languages).filter(
    (l) => !SUPPORT_ONLY_LANGS.has(l.toLowerCase()),
  );
  const allLanguageNames = Object.keys(languages);
  const technologies = detectTechnologies(
    languageNames.length ? languageNames : allLanguageNames,
    `${meta.description ?? ""} ${(meta.topics ?? []).join(" ")} ${packageJson} ${readmeRaw.slice(0, 2000)}`,
  );
  const weeks = estimateWeeks(commits);
  const commitCount = commits.length;
  const activityStatus = deriveActivityStatus(meta);
  const homepage = normalizeUrl(meta.homepage);
  const latestRelease = releases[0]?.tag_name ?? null;
  const releasePublishedAt = releases[0]?.published_at ?? null;
  const contributorCount = contributors.length || 1;

  const readmeFeatures = featuresFromReadme(readmeRaw);
  const commitFeatures = featuresFromCommits(commits.map((c) => c.commit.message));
  const features =
    readmeFeatures.length >= 2
      ? readmeFeatures.slice(0, 4)
      : uniqueItems([...readmeFeatures, ...commitFeatures]).slice(0, 4);

  const engineering = detectEngineering({
    tree,
    packageJson,
    readme: readmeRaw,
  });

  const hasWorkflows = tree.some((t) => t.path.startsWith(".github/workflows/"));
  const hasTests = engineering.some((e) => /test/i.test(e.text));
  const hasApi = tree.some((t) =>
    /\/(api|routes|controllers|handlers)\//.test(t.path) ||
    t.path.includes("app/api/") ||
    t.path.includes("pages/api/"),
  );

  const architectureFlow = buildArchitectureFlow({
    tree,
    packageJson,
    readme: readmeRaw,
    technologies,
  });

  const evidence = buildEvidence({
    tree,
    packageJson,
    hasWorkflows,
    hasTests,
    contributors: contributorCount,
    hasApi,
  });

  const shipped = buildShippedPoints({
    homepage,
    latestRelease,
    hasWorkflows,
    hasTests,
    pushedAt: meta.pushed_at,
    featureCount: features.length,
    releasePublishedAt,
  });

  const periodLabel = buildPeriodLabel({
    latestRelease,
    releasePublishedAt,
    homepage,
    activityStatus,
  });

  const statusLabel = defaultStatusLabel(activityStatus, homepage);

  const links: StoryLink[] = [];
  if (homepage) links.push({ label: "View Demo", url: homepage });
  links.push({ label: "GitHub", url: meta.html_url });

  const tagline =
    meta.description ||
    `A project built with ${technologies.slice(0, 2).join(" & ") || "care"}.`;

  // Role is owner-edited when known; suggest a light default from team size.
  const role =
    contributorCount > 1
      ? `Contributor on a ${contributorCount}-person project`
      : "Solo developer";

  return {
    id: String(meta.id),
    name: meta.name,
    description: tagline,
    emoji: "◆",
    accent: "#fafafa",
    languages: allLanguageNames.length
      ? allLanguageNames
      : [meta.language || "Unknown"],
    technologies,
    topics: meta.topics ?? [],
    homepage,
    activityStatus,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    commits: commitCount,
    weeks,
    contributors: contributorCount,
    releases: releases.length,
    status: "generated",
    updatedAt: new Date().toISOString(),
    pushedAt: meta.pushed_at,
    template: "minimal",
    carousel: {
      tagline,
      homepage,
      activityStatus,
      statusLabel,
      role,
      teamSize: contributorCount,
      features,
      architectureFlow,
      engineering,
      evidence,
      shipped,
      periodLabel,
      latestRelease,
      impact: null,
      githubUrl: meta.html_url,
      links,
      proofLink: homepage,
      proofImage: null,
    },
  };
}

function deriveActivityStatus(meta: GhRepo): ActivityStatus {
  if (meta.archived) return "archived";
  const pushed = meta.pushed_at ? new Date(meta.pushed_at).getTime() : 0;
  if (!pushed) return "inactive";
  const days = (Date.now() - pushed) / 86_400_000;
  if (days <= 45) return "active";
  if (days <= 180) return "recent";
  return "inactive";
}

function normalizeUrl(url: string | null | undefined) {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function estimateWeeks(commits: GhCommit[]) {
  if (commits.length < 2) return commits.length ? 1 : 0;
  const times = commits
    .map((c) => c.commit.author?.date || c.commit.committer?.date)
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime())
    .sort((a, b) => a - b);
  if (times.length < 2) return 1;
  const spanDays = (times[times.length - 1] - times[0]) / 86_400_000;
  return Math.max(1, Math.min(52, Math.ceil(spanDays / 7)));
}

async function fetchCommits(owner: string, repo: string, token: string) {
  const pages: GhCommit[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await gh<GhCommit[]>(
      `/repos/${owner}/${repo}/commits?per_page=100&page=${page}`,
      token,
    );
    pages.push(...batch);
    if (batch.length < 100) break;
  }
  return pages;
}

async function fetchReadme(owner: string, repo: string, token: string) {
  const data = await ghOptional<GhContent>(`/repos/${owner}/${repo}/readme`, token);
  if (!data?.content) return "";
  try {
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return "";
  }
}

async function fetchTree(owner: string, repo: string, branch: string, token: string) {
  const data = await ghOptional<GhTree>(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    token,
  );
  return data?.tree?.filter((t) => t.type === "blob" || t.type === "tree") ?? [];
}

async function fetchPackageJson(owner: string, repo: string, token: string) {
  const data = await ghOptional<GhContent>(
    `/repos/${owner}/${repo}/contents/package.json`,
    token,
  );
  if (!data?.content) return "";
  try {
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function uniqueItems<T extends { text: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = item.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
