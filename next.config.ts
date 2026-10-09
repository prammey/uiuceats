import type { NextConfig } from "next";

// Fully static site: the collector commits data/events.json and Vercel
// rebuilds the export on every push. No server, no database.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
