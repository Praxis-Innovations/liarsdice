import { BREAKPOINTS, getBreakpoint, isCompactWidth, isDesktopWidth } from "../breakpoints";

describe("breakpoints", () => {
  it("matches Tailwind md/lg thresholds", () => {
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
  });

  it("classifies phone / tablet / laptop", () => {
    expect(getBreakpoint(375)).toBe("phone");
    expect(getBreakpoint(767)).toBe("phone");
    expect(getBreakpoint(768)).toBe("tablet");
    expect(getBreakpoint(1023)).toBe("tablet");
    expect(getBreakpoint(1024)).toBe("laptop");
    expect(getBreakpoint(1440)).toBe("laptop");
  });

  it("keeps chrome desktop nav in sync with laptop breakpoint", () => {
    expect(isDesktopWidth(1023)).toBe(false);
    expect(isCompactWidth(1023)).toBe(true);
    expect(isDesktopWidth(1024)).toBe(true);
    expect(isCompactWidth(1024)).toBe(false);
  });
});
