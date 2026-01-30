import type { Config } from "tailwindcss";
import sharedConfig from "@sparc/config-tailwind/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
