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
}

export type ActivityStatus = "active" | "recent" | "archived" | "inactive";

export interface StoryLink {
  label: string;
  url: string;
}

export interface StoryCarousel {
  /** Short project pitch (repo description). */
  tagline: string;
  homepage: string | null;
  activityStatus: ActivityStatus;
  /** Card 2 — what was delivered. */
  features: StoryItem[];
  /** Card 3 — engineering depth signals. */
  engineering: StoryItem[];
  /** Card 4 — proof it ships. */
  shipped: StoryItem[];
  /** Supporting context, e.g. "Built over 6 weeks · 2 releases". */
  periodLabel: string;
  latestRelease: string | null;
  githubUrl: string;
  links: StoryLink[];
  /**
   * Optional proof media on the Shipped card — paste a link or image URL,
   * or upload/paste an image (stored as a data URL).
   */
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
  /** Stack shown as supporting text on Project card. */
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
  { id: "linkedin-square", label: "LinkedIn Square", width: 1200, height: 1200 },
  { id: "instagram", label: "Instagram", width: 1080, height: 1080 },
  { id: "twitter", label: "Twitter / X", width: 1600, height: 900 },
];

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  tagline: string;
}[] = [
  { id: "minimal", name: "Minimal", tagline: "Light canvas. Editorial rules. LinkedIn-clean." },
  { id: "dark", name: "Dark", tagline: "Soft aurora. Night mode focus." },
  { id: "gradient", name: "Gradient", tagline: "Centered drama. Soft bloom energy." },
];

export const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  active: "Active",
  recent: "Recently updated",
  archived: "Archived",
  inactive: "Inactive",
};

export const SOURCE_LABELS: Record<FieldSource, string> = {
  detected: "Detected",
  suggested: "Suggested",
  custom: "Added by you",
};

export function newStoryItem(text: string, source: FieldSource = "custom"): StoryItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 10)}`,
    text,
    source,
  };
}
