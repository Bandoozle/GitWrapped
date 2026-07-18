export type TemplateId = "minimal" | "dark" | "gradient";

export type ExportFormat =
  | "linkedin-square"
  | "linkedin-portrait"
  | "twitter"
  | "instagram";

export interface ExportSize {
  id: ExportFormat;
  label: string;
  width: number;
  height: number;
}

/** Where a carousel bullet came from — shown so cards stay trustworthy. */
export type FieldSource = "detected" | "suggested" | "custom";

export interface StoryItem {
  id: string;
  text: string;
  source: FieldSource;
  /** Optional short provenance shown in the editor. */
  basis?: string | null;
}

export type ActivityStatus = "active" | "recent" | "archived" | "inactive";

export interface StoryLink {
  label: string;
  url: string;
}

export interface StoryCarousel {
  /** Short project pitch (repo description / problem + solution). */
  tagline: string;
  homepage: string | null;
  activityStatus: ActivityStatus;
  /** Human status line, e.g. "Working prototype". */
  statusLabel: string;
  /** Optional role line, e.g. "Full-stack and AI development". */
  role: string | null;
  /** Contributors count when known. */
  teamSize: number | null;
  /** Card 2 — up to ~4 product capabilities. */
  features: StoryItem[];
  /**
   * Card 3 — How It Works architecture flow steps,
   * e.g. ["Live transcript", "Relevance filter", "AI processing"].
   */
  architectureFlow: string[];
  /** Card 3 — evidence-backed engineering highlights (max ~4 shown). */
  engineering: StoryItem[];
  /** Card 3 — small evidence chips, e.g. "Tests detected · CI configured". */
  evidence: string[];
  /** Card 4 — What It Achieved delivery milestones. */
  shipped: StoryItem[];
  /**
   * Supporting context — prefer release wording over "last updated",
   * e.g. "Stable prototype · Last release October 2025".
   */
  periodLabel: string;
  latestRelease: string | null;
  /**
   * Optional owner-edited outcome. Never auto-generated.
   * Shown prominently on What It Achieved when present.
   * e.g. "Tested with 12 users".
   */
  impact: string | null;
  githubUrl: string;
  links: StoryLink[];
  /** Optional project media on Snapshot — demo link (opens from image) and/or screenshot. */
  proofLink: string | null;
  proofImage: string | null;
}

export interface ProjectStory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  accent: string;
  languages: string[];
  /** Stack shown on Project card as icon pills. */
  technologies: string[];
  topics: string[];
  homepage: string | null;
  activityStatus: ActivityStatus;
  stars: number;
  forks: number;
  commits: number;
  weeks: number;
  contributors: number;
  releases: number;
  status: "ready" | "generated" | "not_generated";
  updatedAt: string;
  pushedAt: string | null;
  carousel: StoryCarousel;
  template: TemplateId;
  customTitle?: string;
  shareId?: string;
}

export interface RepoOption {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  private?: boolean;
  htmlUrl?: string;
}

export const EXPORT_SIZES: ExportSize[] = [
  { id: "linkedin-portrait", label: "LinkedIn Portrait", width: 1080, height: 1350 },
  { id: "linkedin-square", label: "LinkedIn Square", width: 1080, height: 1080 },
  { id: "instagram", label: "Instagram", width: 1080, height: 1350 },
  { id: "twitter", label: "Twitter / X", width: 1600, height: 900 },
];

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  tagline: string;
}[] = [
  { id: "minimal", name: "Minimal", tagline: "Light canvas. Editorial rules. LinkedIn-clean." },
  { id: "dark", name: "Dark", tagline: "Flat black canvas. Soft single-color glow." },
  { id: "gradient", name: "Gradient", tagline: "Purple–teal mesh. Dual neon blooms." },
];

export const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  active: "Active development",
  recent: "Recently updated",
  archived: "Archived",
  inactive: "Inactive",
};

export const SOURCE_LABELS: Record<FieldSource, string> = {
  detected: "Detected from GitHub",
  suggested: "Suggested",
  custom: "Added by you",
};

export function newStoryItem(
  text: string,
  source: FieldSource = "custom",
  basis?: string | null,
): StoryItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 10)}`,
    text,
    source,
    basis: basis ?? null,
  };
}

/** Fill missing carousel fields for stories saved before the What It Achieved schema. */
export function normalizeCarousel(
  carousel: Partial<StoryCarousel> &
    Pick<StoryCarousel, "tagline" | "features" | "engineering" | "shipped" | "githubUrl" | "links">,
  fallbacks?: {
    activityStatus?: ActivityStatus;
    contributors?: number;
    homepage?: string | null;
  },
): StoryCarousel {
  const activityStatus = carousel.activityStatus ?? fallbacks?.activityStatus ?? "active";
  return {
    tagline: carousel.tagline,
    homepage: carousel.homepage ?? fallbacks?.homepage ?? null,
    activityStatus,
    statusLabel: carousel.statusLabel ?? defaultStatusLabel(activityStatus, carousel.homepage ?? null),
    role: carousel.role ?? null,
    teamSize: carousel.teamSize ?? fallbacks?.contributors ?? null,
    features: carousel.features ?? [],
    architectureFlow: carousel.architectureFlow?.length
      ? carousel.architectureFlow
      : ["Input", "Processing", "Output", "Interface"],
    engineering: carousel.engineering ?? [],
    evidence: carousel.evidence ?? [],
    shipped: carousel.shipped ?? [],
    periodLabel: carousel.periodLabel ?? "",
    latestRelease: carousel.latestRelease ?? null,
    impact: carousel.impact ?? null,
    githubUrl: carousel.githubUrl,
    links: carousel.links ?? [],
    proofLink: carousel.proofLink ?? null,
    proofImage: carousel.proofImage ?? null,
  };
}

export function defaultStatusLabel(
  activity: ActivityStatus,
  homepage: string | null,
): string {
  if (activity === "archived") return "Archived project";
  if (homepage) return "Live demo available";
  if (activity === "active") return "Working prototype";
  if (activity === "recent") return "Stable prototype";
  return "Prototype";
}
