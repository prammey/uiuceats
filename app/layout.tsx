import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FoodPlease · Free food at UIUC, today",
  description:
    "Free, walk-in food events at the University of Illinois Urbana-Champaign for the next 7 days, pulled from official campus calendars with a proof link on every listing.",
  openGraph: {
    title: "FoodPlease · Free food at UIUC, today",
    description: "Where to eat for free on campus this week. Every listing links to its source.",
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
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
