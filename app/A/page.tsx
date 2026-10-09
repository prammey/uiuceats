import type { Metadata } from "next";
import PageA from "@/components/a/PageA";

export const metadata: Metadata = {
  title: "UIUC Eats 🍕 Free food on campus this week",
  openGraph: {
    title: "UIUC Eats 🍕 Free food on campus this week",
    description: "Out of swipes? Here's where to eat for free on campus this week. Every listing links to its source.",
    type: "website",
  },
};

export default function VersionA() {
  return <PageA />;
}
