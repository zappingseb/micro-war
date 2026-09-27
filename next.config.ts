import type { NextConfig } from "next";

/**
 * MicroWar ships as a single static artifact.
 *
 * `output: "export"` makes `npm run build` emit a fully self-contained `out/`
 * directory that can be dropped on any static host (S3, nginx, Netlify, a USB
 * stick) with no Node runtime. All data comes from the mock backend in
 * `src/lib/api.ts`, which is plain JS bundled into the artifact.
 *
 * Deploy target is a SUBDIRECTORY, not a domain root:
 *   https://engel-wolf.com/documents/micro-war/index.html
 *
 * That makes `basePath` mandatory — without it the exported HTML requests
 * `/_next/static/...` from the domain root and the page loads unstyled with no
 * JS. `basePath` is read from the environment so the same source also builds
 * for a root-domain deploy (set it to "" or leave unset).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Trailing slash matters here: it makes assetPrefix resolve correctly and
  // writes a real index.html into every route folder, which is the only reason
  // deep links work without server-side rewrites.
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    // No Next image optimisation server exists in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
