import { describe, expect, it } from "vitest";
import { buttonClass } from "./button";

describe("buttonClass", () => {
  it("includes shared base affordances (focus ring + press feedback)", () => {
    const cls = buttonClass();
    expect(cls).toContain("focus-visible:ring-2");
    expect(cls).toContain("active:scale-[0.97]");
    expect(cls).toContain("disabled:opacity-45");
  });

  it("applies variant styles", () => {
    expect(buttonClass("primary")).toContain("bg-white");
    expect(buttonClass("secondary")).toContain("border-border");
    expect(buttonClass("ghost")).toContain("hover:bg-surface");
  });

  it("applies size styles", () => {
    expect(buttonClass("primary", "sm")).toContain("h-8");
    expect(buttonClass("primary", "md")).toContain("h-10");
    expect(buttonClass("primary", "lg")).toContain("h-11");
  });

  it("merges extra classes and lets them win over defaults", () => {
    expect(buttonClass("primary", "md", "h-14")).toContain("h-14");
    expect(buttonClass("primary", "md", "h-14")).not.toContain("h-10");
  });
});
