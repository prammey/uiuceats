import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UIUC Eats 🍕 Free food on campus this week",
  description:
    "Free, walk-in food events at the University of Illinois Urbana-Champaign for the next 7 days, pulled from official campus calendars with a source link on every listing.",
  openGraph: {
    title: "UIUC Eats 🍕 Free food on campus this week",
    description: "Out of swipes? Here's where to eat for free on campus this week. Every listing links to its source.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5f05",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
