import { describe, expect, it } from "vitest";
import {
  buildFeatures,
  featuresFromCommits,
  featuresFromReadme,
} from "./github-signals";
describe("featuresFromReadme", () => {
  it("keeps full capability sentences from feature bullets", () => {
    const readme = `
# Demo
## Features
- Captures live meeting captions and turns them into summaries
- Routes authenticated users from login into the dashboard
`;
    const features = featuresFromReadme(readme);
    expect(features.length).toBeGreaterThanOrEqual(2);
    for (const f of features) {
      expect(f.text.split(/\s+/).length).toBeGreaterThanOrEqual(6);
      expect(f.text.length).toBeGreaterThanOrEqual(42);
    }
  });
});

describe("featuresFromCommits", () => {
  it("expands short feat commits into substantial lines", () => {
    const features = featuresFromCommits([
      "feat: login integration",
      "feat: fake users",
      "feat: MatchMap",
    ]);
    expect(features.length).toBeGreaterThan(0);
    for (const f of features) {
      expect(f.text.length).toBeGreaterThanOrEqual(42);
    }
  });
});

describe("buildFeatures", () => {
  it("falls back to context when readme/commits are vague", () => {
    const features = buildFeatures({
      readme: "# Tiny\n\n- x\n",
      commitMessages: ["wip", "tmp"],
      description: "A map app for matching places with friends in realtime.",
      name: "MatchMap",
      technologies: ["TypeScript", "Next.js"],
      tree: [
        { path: "app/api/auth/route.ts", type: "blob" },
        { path: "app/dashboard/page.tsx", type: "blob" },
        { path: "components/Map.tsx", type: "blob" },
      ],
      packageJson: JSON.stringify({ dependencies: { "next-auth": "5.0.0" } }),
    });
    expect(features.length).toBeGreaterThanOrEqual(2);
    for (const f of features) {
      expect(f.text.split(/\s+/).length).toBeGreaterThanOrEqual(6);
    }
  });
});
