import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  // No remote image hosts: every image the site still ships is local. The
  // previous unsplash / ui-avatars / worldvectorlogo entries belonged to
  // decorative sections and a third-party logo marquee that no longer exist.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
