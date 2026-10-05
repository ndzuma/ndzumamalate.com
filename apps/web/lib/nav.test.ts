import { describe, expect, test } from "bun:test";
import { NAV_ITEMS, visibleNavItems } from "./nav";

const labels = (items: { label: string }[]) => items.map((i) => i.label);

describe("visibleNavItems", () => {
  test("shows everything when nothing is hidden", () => {
    expect(labels(visibleNavItems([], true))).toEqual(labels(NAV_ITEMS));
  });

  test("drops pages hidden in the CMS", () => {
    expect(labels(visibleNavItems(["this", "stack"], true))).toEqual(["Projects", "Writings", "Experience"]);
  });

  test("hides writings until there are some", () => {
    expect(labels(visibleNavItems([], false))).not.toContain("Writings");
  });
});
