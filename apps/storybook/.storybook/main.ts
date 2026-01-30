import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    // Get absolute path to the monorepo root
    const monorepoRoot = path.resolve(__dirname, "../../..");
    
    // Ensure proper resolution of workspace packages in monorepo
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Resolve @sparc/ui to the actual package source
      "@sparc/ui": path.join(monorepoRoot, "packages/ui/src"),
    };
    
    return config;
  },
};

export default config;
