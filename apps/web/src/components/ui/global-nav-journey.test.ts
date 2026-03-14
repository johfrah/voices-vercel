import { describe, expect, it } from "vitest";
import { resolveGlobalNavJourneyKey } from "./global-nav-journey";

describe("resolveGlobalNavJourneyKey", () => {
  it("maps world IDs to the expected journey keys", () => {
    expect(resolveGlobalNavJourneyKey(2, "/agency")).toBe("studio");
    expect(resolveGlobalNavJourneyKey(3, "/agency")).toBe("academy");
    expect(resolveGlobalNavJourneyKey(6, "/agency")).toBe("ademing");
    expect(resolveGlobalNavJourneyKey(5, "/agency")).toBe("portfolio");
    expect(resolveGlobalNavJourneyKey(25, "/agency")).toBe("artist");
    expect(resolveGlobalNavJourneyKey(10, "/agency")).toBe("johfrai");
    expect(resolveGlobalNavJourneyKey(7, "/agency")).toBe("freelance");
    expect(resolveGlobalNavJourneyKey(8, "/agency")).toBe("partner");
  });

  it("prioritizes world ID over pathname fallback", () => {
    expect(resolveGlobalNavJourneyKey(2, "/academy/intro")).toBe("studio");
  });

  it("falls back to pathname routing when world ID is not mapped", () => {
    expect(resolveGlobalNavJourneyKey(undefined, "/studio/workshop")).toBe("studio");
    expect(resolveGlobalNavJourneyKey(1, "/partner/contact")).toBe("partner");
    expect(resolveGlobalNavJourneyKey(undefined, "/agency/studio/mix")).toBe("studio");
  });

  it("defaults to agency when no mapping matches", () => {
    expect(resolveGlobalNavJourneyKey(undefined, "/onbekend")).toBe("agency");
    expect(resolveGlobalNavJourneyKey(null, "")).toBe("agency");
  });
});
