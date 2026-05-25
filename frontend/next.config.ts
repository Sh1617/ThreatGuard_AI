import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // All /api/* requests from the browser are proxied to FastAPI.
        // This avoids CORS completely in development AND production
        // (as long as both servers run on the same host).
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;