export type HideablePage = "stack" | "projects" | "writings" | "experience" | "this";

export type NavItem = { href: string; label: string; key: HideablePage };

export const NAV_ITEMS: NavItem[] = [
  { href: "/projects", label: "Projects", key: "projects" },
  { href: "/writings", label: "Writings", key: "writings" },
  { href: "/experience", label: "Experience", key: "experience" },
  { href: "/stack", label: "Stack", key: "stack" },
  { href: "/this", label: "This", key: "this" },
];

/** Nav entries to show: drops pages hidden in the CMS, and writings until there are some. */
export function visibleNavItems(hidden: readonly HideablePage[], hasWritings: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (hidden.includes(item.key)) return false;
    if (item.key === "writings" && !hasWritings) return false;
    return true;
  });
}
