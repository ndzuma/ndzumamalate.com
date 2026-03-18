import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience",
  description: "Work history and technical skills.",
};

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
