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

/** Landing Examples — fake projects so visitors can preview real carousel cards. */
export const EXAMPLE_STORIES: ProjectStory[] = [
  baseStory({
    id: "example-bargai",
    name: "BargAI",
    description:
      "A real-time AI meeting assistant that turns live captions into summaries and next steps.",
    languages: ["Python", "JavaScript"],
    technologies: ["Python", "JavaScript", "Gemini API", "Selenium"],
    topics: ["ai", "meetings"],
    homepage: "https://example.com/bargai",
    activityStatus: "active",
    commits: 126,
    weeks: 4,
    contributors: 1,
    releases: 1,
    template: "dark",
    carousel: {
      tagline:
        "A real-time AI meeting assistant that turns live captions into summaries, insights, and follow-up points.",
      homepage: "https://example.com/bargai",
      activityStatus: "active",
      statusLabel: "Working prototype",
      role: "Full-stack Developer",
      teamSize: 1,
      features: [
        newStoryItem("Live transcript capture from Meet and Zoom", "detected", "README"),
        newStoryItem("Context-aware AI responses in under 3 seconds", "detected", "README"),
        newStoryItem("Relevance filtering before model processing", "suggested", "Commits"),
        newStoryItem("Automatic summaries and action items", "detected", "README"),
      ],
      architectureFlow: [
        "Live transcript",
        "Relevance filter",
        "AI processing",
        "Structured response",
        "Meeting interface",
      ],
      engineering: [
        newStoryItem("Asynchronous transcript-processing pipeline", "detected", "Services"),
        newStoryItem("Python service connected to a JavaScript interface", "detected", "API bridge"),
        newStoryItem("Structured handling for empty or irrelevant model output", "detected", "Guards"),
      ],
      evidence: ["Tests detected", "CI configured", "API integration", "Solo-built"],
      shipped: [
        newStoryItem("Working end-to-end prototype", "suggested"),
        newStoryItem("Live transcript-to-insight workflow shipped", "detected", "Demo"),
        newStoryItem("Shipped v1.0 · October 2025", "detected", "Releases"),
      ],
      periodLabel: "Stable prototype · Last release October 2025",
      latestRelease: "v1.0",
      impact: null,
      githubUrl: "https://github.com/example/bargai",
      links: [
        { label: "View Demo", url: "https://example.com/bargai" },
        { label: "GitHub", url: "https://github.com/example/bargai" },
      ],
      proofLink: null,
      proofImage: null,
    },
  }),
  baseStory({
    id: "example-homehub",
    name: "HomeHub",
    description: "A restaurant inventory platform for tracking stock, waste, and purchasing.",
    languages: ["TypeScript"],
    technologies: ["TypeScript", "Next.js", "Supabase"],
    topics: ["inventory"],
    homepage: "https://example.com/homehub",
    activityStatus: "active",
    commits: 84,
    weeks: 6,
    contributors: 1,
    releases: 2,
    template: "minimal",
    carousel: {
      tagline: "A restaurant inventory platform for tracking stock, waste, and purchasing.",
      homepage: "https://example.com/homehub",
      activityStatus: "active",
      statusLabel: "Working prototype",
      role: "Full-stack development",
      teamSize: 1,
      features: [
        newStoryItem("Authentication and onboarding", "detected", "README"),
        newStoryItem("Inventory tracking across locations", "detected", "README"),
        newStoryItem("Supplier management workflows", "suggested", "Commits"),
        newStoryItem("Admin dashboard for waste insights", "detected", "README"),
      ],
      architectureFlow: ["Stock event", "Validation", "Database write", "Dashboard update"],
      engineering: [
        newStoryItem("Role-based access control", "detected", "Auth"),
        newStoryItem("Row-level database security", "detected", "Migrations"),
        newStoryItem("Reusable component architecture", "detected", "Components"),
      ],
      evidence: ["Tests detected", "CI configured", "API integration", "Solo-built"],
      shipped: [
        newStoryItem("Live demo available for an end-to-end walkthrough", "detected", "Homepage"),
        newStoryItem("Core product workflows shipped end-to-end", "suggested"),
        newStoryItem("Shipped v1.2.0 · July 2026", "detected", "Releases"),
      ],
      periodLabel: "Released July 2026",
      latestRelease: "v1.2.0",
      impact: null,
      githubUrl: "https://github.com/example/homehub",
      links: [
        { label: "View Demo", url: "https://example.com/homehub" },
        { label: "GitHub", url: "https://github.com/example/homehub" },
      ],
      proofLink: null,
      proofImage: null,
    },
  }),
  baseStory({
    id: "example-pulse",
    name: "PulseBoard",
    description: "A lightweight ops dashboard that turns service health checks into clear incident signals.",
    languages: ["TypeScript", "Go"],
    technologies: ["TypeScript", "Go", "PostgreSQL", "Docker"],
    topics: ["ops", "monitoring"],
    homepage: null,
    activityStatus: "recent",
    commits: 210,
    weeks: 9,
    contributors: 2,
    releases: 3,
    template: "gradient",
    carousel: {
      tagline:
        "A lightweight ops dashboard that turns service health checks into clear incident signals.",
      homepage: null,
      activityStatus: "recent",
      statusLabel: "Internal tool",
      role: "Backend and dashboard development",
      teamSize: 2,
      features: [
        newStoryItem("Service health aggregation", "detected", "README"),
        newStoryItem("Incident signal ranking", "suggested", "Commits"),
        newStoryItem("On-call notification hooks", "detected", "README"),
        newStoryItem("Historical uptime views", "detected", "Components"),
      ],
      architectureFlow: ["Health probe", "Aggregation service", "Store", "Dashboard"],
      engineering: [
        newStoryItem("Go service with typed API contracts", "detected", "API"),
        newStoryItem("Containerized local and CI environments", "detected", "Docker"),
        newStoryItem("Automated deployment workflow", "detected", "CI"),
      ],
      evidence: ["Tests detected", "CI configured", "Docker present", "2 contributors"],
      shipped: [
        newStoryItem("Core monitoring workflows shipped end-to-end", "suggested"),
        newStoryItem("Quality gates in place for ongoing delivery", "detected", "CI"),
        newStoryItem("Shipped v0.9.1 · June 2026", "detected", "Releases"),
      ],
      periodLabel: "Stable prototype · Last release June 2026",
      latestRelease: "v0.9.1",
      impact: null,
      githubUrl: "https://github.com/example/pulseboard",
      links: [{ label: "GitHub", url: "https://github.com/example/pulseboard" }],
      proofLink: null,
      proofImage: null,
    },
  }),
];

/** Visual sample for template previews — mirrors HomeHub example. */
export const PREVIEW_STORY: ProjectStory =
  EXAMPLE_STORIES.find((s) => s.id === "example-homehub") ?? EXAMPLE_STORIES[0]!;
