import type { Metadata, Viewport } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// Illinois brand type pairing: Montserrat for headings, Source Sans for body.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus this week",
  description:
    "Free, walk-in food events at the University of Illinois Urbana-Champaign for the next 7 days, pulled from official campus calendars with a source link on every listing.",
  openGraph: {
    title: "UIUC Eats · Free food on campus this week",
    description: "Where to eat for free on campus this week. Every listing links to its source.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#13294b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
