import type { Config } from "tailwindcss";
import sharedConfig from "@sparc/config-tailwind/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./stories/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
