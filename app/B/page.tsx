import type { Metadata } from "next";
import PageB from "@/components/b/PageB";

export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus. Order up.",
  openGraph: {
    title: "UIUC Eats · Free food on campus. Order up.",
    description: "Walk-in, no-cost food events at UIUC this week, straight from official campus calendars.",
    type: "website",
  },
};

export default function VersionB() {
  return <PageB />;
}
