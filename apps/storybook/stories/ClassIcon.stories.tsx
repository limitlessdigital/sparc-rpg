import type { Meta, StoryObj } from "@storybook/react";
import { ClassIcon, CHARACTER_CLASSES, CLASS_INFO } from "@sparc/ui";

const meta: Meta<typeof ClassIcon> = {
  title: "Components/ClassIcon",
  component: ClassIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    characterClass: {
      control: "select",
      options: CHARACTER_CLASSES,
    },
    variant: {
      control: "select",
      options: ["dark", "light"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Warrior: Story = {
  args: {
    characterClass: "warrior",
    variant: "dark",
    size: "lg",
  },
};

export const Wizard: Story = {
  args: {
    characterClass: "wizard",
    variant: "dark",
    size: "lg",
  },
};

export const Rogue: Story = {
  args: {
    characterClass: "rogue",
    variant: "dark",
    size: "lg",
  },
};

export const Cleric: Story = {
  args: {
    characterClass: "cleric",
    variant: "dark",
    size: "lg",
  },
};

export const Necromancer: Story = {
  args: {
    characterClass: "necromancer",
    variant: "dark",
    size: "lg",
  },
};

export const Paladin: Story = {
  args: {
    characterClass: "paladin",
    variant: "dark",
    size: "lg",
  },
};

export const Ranger: Story = {
  args: {
    characterClass: "ranger",
    variant: "dark",
    size: "lg",
  },
};

// All classes in dark variant
export const AllClassesDark: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap justify-center p-4 bg-surface-base rounded-lg">
      {CHARACTER_CLASSES.map((cls) => (
        <div key={cls} className="flex flex-col items-center gap-2">
          <ClassIcon characterClass={cls} variant="dark" size="xl" />
          <span className="text-sm text-muted-foreground">{CLASS_INFO[cls].name}</span>
        </div>
      ))}
    </div>
  ),
};

// All classes in light variant
export const AllClassesLight: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap justify-center p-4 bg-white rounded-lg">
      {CHARACTER_CLASSES.map((cls) => (
        <div key={cls} className="flex flex-col items-center gap-2">
          <ClassIcon characterClass={cls} variant="light" size="xl" />
          <span className="text-sm text-gray-700">{CLASS_INFO[cls].name}</span>
        </div>
      ))}
    </div>
  ),
};

// Size comparison
export const SizeComparison: Story = {
  render: () => (
    <div className="flex gap-8 items-end p-4 bg-surface-base rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <ClassIcon characterClass="warrior" variant="dark" size="sm" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ClassIcon characterClass="warrior" variant="dark" size="md" />
        <span className="text-xs text-muted-foreground">md</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ClassIcon characterClass="warrior" variant="dark" size="lg" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ClassIcon characterClass="warrior" variant="dark" size="xl" />
        <span className="text-xs text-muted-foreground">xl</span>
      </div>
    </div>
  ),
};
