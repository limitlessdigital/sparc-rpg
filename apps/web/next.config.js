/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sparc/ui", "@sparc/api", "@sparc/db", "@sparc/game-logic"],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
