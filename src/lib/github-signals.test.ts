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
  it("always returns at least three substantial bullets", () => {
    const features = buildFeatures({
      readme: "# Tiny\n",
      commitMessages: [],
      description: "Short",
      name: "Remy",
      technologies: ["React"],
      tree: [],
      packageJson: "{}",
    });
    expect(features.length).toBeGreaterThanOrEqual(3);
    for (const f of features) {
      expect(f.text.split(/\s+/).length).toBeGreaterThanOrEqual(6);
    }
  });
});
