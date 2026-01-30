/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sparc/ui", "@sparc/api", "@sparc/db", "@sparc/game-logic"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
