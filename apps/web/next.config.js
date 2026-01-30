/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sparc/ui", "@sparc/api", "@sparc/db", "@sparc/game-logic"],
};

module.exports = nextConfig;
