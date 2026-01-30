"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MonsterCreator,
  ItemCreator,
  AbilityCreator,
  ClassCreator,
  Button,
  HomebrewCategory,
  MonsterData,
  ItemData,
  AbilityData,
  ClassData,
  useToast,
} from "@sparc/ui";

// Mock data matching the main homebrew page
const MOCK_HOMEBREW: Record<string, {
  id: string;
  name: string;
  description: string;
  category: HomebrewCategory;
  tags: string[];
  data: MonsterData | ItemData | AbilityData | ClassData;
}> = {
  "hb_1": {
    id: "hb_1",
    name: "Shadow Stalker",
    description: "A creature of pure darkness that hunts from the shadows.",
    category: "monster",
    tags: ["undead", "shadow", "stealth"],
    data: {
      hitPoints: 45,
      armorClass: 14,
      might: 3,
      grace: 4,
      wit: 2,
      heart: 1,
      attacks: [
        {
          id: "attack_1",
          name: "Shadow Strike",
          attribute: "grace",
          diceCount: 3,
          damageType: "necrotic",
        },
      ],
      abilities: [
        {
          id: "ability_1",
          name: "Shadow Meld",
          description: "Can become invisible in dim light or darkness.",
          cooldown: 2,
        },
      ],
      type: "undead",
      size: "medium",
      challengeRating: 4,
    } as MonsterData,
  },
  "hb_2": {
    id: "hb_2",
    name: "Frostbrand Dagger",
    description: "A blade of eternal ice, forged in the heart of the Northern Wastes.",
    category: "item",
    tags: ["ice", "weapon", "rare"],
    data: {
      itemType: "weapon",
      rarity: "rare",
      statModifiers: [
        { attribute: "grace", modifier: 1 },
      ],
      specialEffects: [
        {
          id: "effect_1",
          name: "Frost Bite",
          description: "On hit, deal 1d4 additional cold damage.",
          trigger: "on_hit",
        },
      ],
      requirements: [],
    } as ItemData,
  },
};

const CATEGORY_TITLES: Record<HomebrewCategory, string> = {
  monster: "Edit Monster",
  item: "Edit Item",
  ability: "Edit Ability",
  spell: "Edit Spell",
  class: "Edit Class",
};

export default function EditHomebrewPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const id = params.id as string;
  const homebrew = MOCK_HOMEBREW[id];

  // Handle not found
  if (!homebrew) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold mb-2">Homebrew Not Found</h1>
        <p className="text-muted-foreground mb-4">
          Could not find homebrew with ID &quot;{id}&quot;.
        </p>
        <Link href="/homebrew">
          <Button variant="primary">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const { category, data } = homebrew;

  const handleSaveMonster = (monsterData: MonsterData, asDraft?: boolean) => {
    // TODO: Call API to update
    console.log("Updating monster:", id, monsterData, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your monster changes have been saved.",
      });
    } else {
      toast.success("Monster updated!", {
        description: "Your monster changes are now live.",
      });
    }
    router.push("/homebrew");
  };

  const handleSaveItem = (
    itemName: string,
    itemDescription: string,
    itemData: ItemData,
    itemTags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to update
    console.log("Updating item:", id, { name: itemName, description: itemDescription, data: itemData, tags: itemTags }, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your item changes have been saved.",
      });
    } else {
      toast.success("Item updated!", {
        description: "Your item changes are now live.",
      });
    }
    router.push("/homebrew");
  };

  const handleSaveAbility = (
    abilityName: string,
    abilityDescription: string,
    abilityData: AbilityData,
    abilityTags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to update
    console.log("Updating ability:", id, { name: abilityName, description: abilityDescription, data: abilityData, tags: abilityTags }, asDraft);
    const typeLabel = category === "spell" ? "Spell" : "Ability";
    if (asDraft) {
      toast.success("Draft saved!", {
        description: `Your ${category} changes have been saved.`,
      });
    } else {
      toast.success(`${typeLabel} updated!`, {
        description: `Your ${category} changes are now live.`,
      });
    }
    router.push("/homebrew");
  };

  const handleSaveClass = (
    className: string,
    classDescription: string,
    classData: ClassData,
    classTags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to update
    console.log("Updating class:", id, { name: className, description: classDescription, data: classData, tags: classTags }, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your class changes have been saved.",
      });
    } else {
      toast.success("Class updated!", {
        description: "Your class changes are now live.",
      });
    }
    router.push("/homebrew");
  };

  const handleCancel = () => {
    router.push("/homebrew");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/homebrew">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">{CATEGORY_TITLES[category]}</h1>
      </div>

      {/* Creator Component with Initial Data */}
      {category === "monster" && (
        <MonsterCreator
          initialData={{
            ...(data as MonsterData),
          } as MonsterData}
          onSave={handleSaveMonster}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {category === "item" && (
        <ItemCreator
          initialData={{
            ...(data as ItemData),
          } as ItemData}
          onSave={handleSaveItem}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {(category === "ability" || category === "spell") && (
        <AbilityCreator
          initialData={{ ...(data as AbilityData) } as AbilityData}
          isSpell={category === "spell"}
          onSave={handleSaveAbility}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {category === "class" && (
        <ClassCreator
          initialData={{ ...(data as ClassData) } as ClassData}
          onSave={handleSaveClass}
          onCancel={handleCancel}
          showPreview
        />
      )}
    </div>
  );
}
