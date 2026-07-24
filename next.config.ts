import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable webpack symlink resolution: webpack calls fs.readlink() on
  // every resolved module path to check for symlinks. The fs-level patch
  // (windows-readlink-patch.js) converts EISDIR → EINVAL, and this flag
  // further reduces unnecessary readlink calls during module resolution.
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
