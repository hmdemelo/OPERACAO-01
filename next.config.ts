import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      // Jogo estático de primeiros socorros (HTML autocontido em /public).
      // Rewrite para servir a URL limpa /primeirossocorros.
      { source: "/primeirossocorros", destination: "/primeirossocorros.html" },
      // Jogo estático de combate a incêndio (HTML autocontido em /public).
      { source: "/combateaincendio", destination: "/combateaincendio.html" },
    ]
  },
};

export default nextConfig;
