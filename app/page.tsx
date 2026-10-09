import type { Metadata } from "next";
import PageFinal from "@/components/final/PageFinal";

export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus",
  openGraph: {
    title: "UIUC Eats · Free food on campus",
    description: "Out of swipes? Here's where to eat for free on campus. Every listing links to its source.",
    type: "website",
  },
};

// The root serves the final merged version. /A and /B keep the earlier looks.
export default function Home() {
  return <PageFinal />;
}
