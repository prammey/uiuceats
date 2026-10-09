import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts are loaded per version (components/a/PageA.tsx, components/b/PageB.tsx)
// so each look only ships the type it uses.
export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus this week",
  description:
    "Free, walk-in food events at the University of Illinois Urbana-Champaign for the next 7 days, pulled from official campus calendars with a source link on every listing.",
};

export const viewport: Viewport = {
  themeColor: "#ff5f05",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
