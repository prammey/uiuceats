import type { Metadata } from "next";
import PageFinal from "@/components/final/PageFinal";

export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus",
  openGraph: {
    title: "UIUC Eats · Free food on campus",
    description: "Out of swipes? Here's where to eat for free on campus. Every listing links to its source.",
    type: "website",
    url: "https://uiuceats.vercel.app",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "UIUC Eats: free food on campus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UIUC Eats · Free food on campus",
    description: "Out of swipes? Here's where to eat for free on campus. Every listing links to its source.",
    images: ["/og.jpg"],
  },
};

// The root serves the final merged version. /A and /B keep the earlier looks.
export default function Home() {
  return <PageFinal />;
}
