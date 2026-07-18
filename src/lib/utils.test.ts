import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatRelativeDay } from "./utils";

describe("cn", () => {
  it("merges class names and dedupes conflicting tailwind utilities", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe(
      "text-sm font-medium",
    );
  });
});

describe("formatRelativeDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fixed "now": 2026-07-16T12:00:00 local.
    vi.setSystemTime(new Date(2026, 6, 16, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("labels today", () => {
    expect(formatRelativeDay(new Date(2026, 6, 16, 8, 0, 0).toISOString())).toBe(
      "Updated today",
    );
  });

  it("labels yesterday", () => {
    expect(formatRelativeDay(new Date(2026, 6, 15, 8, 0, 0).toISOString())).toBe(
      "Generated yesterday",
    );
  });

  it("labels recent days within a week", () => {
    expect(formatRelativeDay(new Date(2026, 6, 13, 8, 0, 0).toISOString())).toBe(
      "Updated 3 days ago",
    );
  });

  it("falls back to an absolute date beyond a week", () => {
    const result = formatRelativeDay(new Date(2026, 5, 1, 8, 0, 0).toISOString());
    expect(result).not.toMatch(/ago|today|yesterday/);
    expect(result).toMatch(/Jun/);
  });
});
