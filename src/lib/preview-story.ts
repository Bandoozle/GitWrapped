import type { ProjectStory } from "./types";
import { newStoryItem } from "./types";

function baseStory(
  partial: Omit<ProjectStory, "updatedAt" | "pushedAt" | "status" | "stars" | "forks" | "emoji" | "accent">,
): ProjectStory {
  return {
    emoji: "◆",
    accent: "#fafafa",
    stars: 0,
    forks: 0,
    status: "generated",
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
    ...partial,
  };
}

/** Landing / template previews — GitWrapped as the sample project. */
export const EXAMPLE_STORY: ProjectStory = baseStory({
  id: "example-gitwrapped",
  name: "GitWrapped",
  description:
    "Turn any GitHub repository into a recruiter-ready four-card carousel for LinkedIn, X, and portfolios.",
  languages: ["TypeScript"],
  technologies: ["TypeScript", "Next.js", "Auth.js", "Tailwind CSS"],
  topics: ["portfolio", "github", "carousel"],
  homepage: "https://github.com/Bandoozle/GitWrapped",
  activityStatus: "active",
  commits: 48,
  weeks: 3,
  contributors: 1,
  releases: 0,
  template: "dark",
  carousel: {
    tagline:
      "Turn any GitHub repository into a recruiter-ready four-card carousel for LinkedIn, X, and portfolios.",
    homepage: "https://github.com/Bandoozle/GitWrapped",
    activityStatus: "active",
    statusLabel: "Working prototype",
    role: "Full-stack Developer",
    teamSize: 1,
    features: [
      newStoryItem("Import a GitHub repo and generate a four-card project story", "detected", "README"),
      newStoryItem("Edit features, architecture flow, and delivery milestones", "detected", "Editor"),
      newStoryItem("Export PNGs for LinkedIn, Instagram, and X formats", "detected", "Export"),
      newStoryItem("Publish a live share link anyone can browse", "detected", "Share"),
    ],
    architectureFlow: ["GitHub OAuth", "Repo signals", "Story editor", "Carousel export"],
    engineering: [
      newStoryItem("GitHub OAuth with scoped repo import via Auth.js", "detected", "Auth"),
      newStoryItem("Signal detection from README, commits, releases, and stack files", "detected", "Import"),
      newStoryItem("Format-aware slide layouts for portrait, square, and landscape", "detected", "Slides"),
      newStoryItem("Durable share links via Vercel Blob for public /s/[id] pages", "detected", "Share store"),
    ],
    evidence: ["Auth configured", "Export pipeline", "Share links", "Solo-built"],
    shipped: [
      newStoryItem("End-to-end flow from GitHub sign-in to shareable carousel", "suggested"),
      newStoryItem("Multi-format PNG export for LinkedIn, Instagram, and X", "detected", "Export"),
      newStoryItem("Public live links that work without downloading images", "detected", "Share"),
      newStoryItem("Landing demo that shows the same four-card format users generate", "detected", "Landing"),
    ],
    periodLabel: "Active prototype · 2026",
    latestRelease: null,
    impact: null,
    githubUrl: "https://github.com/Bandoozle/GitWrapped",
    links: [
      { label: "GitHub", url: "https://github.com/Bandoozle/GitWrapped" },
    ],
    proofLink: "https://github.com/Bandoozle/GitWrapped",
    proofImage: "/img/gitwrappedhero.png",
  },
});

/** @deprecated Prefer EXAMPLE_STORY — kept as a one-item array for older imports. */
export const EXAMPLE_STORIES: ProjectStory[] = [EXAMPLE_STORY];

/** Visual sample for template previews. */
export const PREVIEW_STORY: ProjectStory = EXAMPLE_STORY;
