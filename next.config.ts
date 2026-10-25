import type { NextConfig } from "next";

const api = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Photos libres du catalogue de démonstration
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // Photos envoyées depuis l'administration
      { protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/api/v1/media/**" },
    ],
  },
};

export default nextConfig;
