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

const CATEGORY_TITLES: Record<HomebrewCategory, string> = {
  monster: "Create Monster",
  item: "Create Item",
  ability: "Create Ability",
  spell: "Create Spell",
  class: "Create Class",
};

export default function CreateHomebrewPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const category = params.category as HomebrewCategory;

  // Validate category
  const validCategories: HomebrewCategory[] = ["monster", "item", "ability", "spell", "class"];
  if (!validCategories.includes(category)) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">❓</p>
        <h1 className="text-2xl font-bold mb-2">Invalid Category</h1>
        <p className="text-muted-foreground mb-4">
          &quot;{category}&quot; is not a valid homebrew category.
        </p>
        <Link href="/homebrew">
          <Button variant="primary">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const handleSaveMonster = (data: MonsterData, asDraft?: boolean) => {
    // TODO: Call API to save
    console.log("Saving monster:", data, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your monster has been saved as a draft.",
      });
    } else {
      toast.success("Monster published!", {
        description: "Your monster is now available in the community library.",
      });
    }
    router.push("/homebrew");
  };

  const handleSaveItem = (
    name: string,
    description: string,
    data: ItemData,
    tags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to save
    console.log("Saving item:", { name, description, data, tags }, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your item has been saved as a draft.",
      });
    } else {
      toast.success("Item published!", {
        description: "Your item is now available in the community library.",
      });
    }
    router.push("/homebrew");
  };

  const handleSaveAbility = (
    name: string,
    description: string,
    data: AbilityData,
    tags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to save
    console.log("Saving ability:", { name, description, data, tags }, asDraft);
    const typeLabel = category === "spell" ? "Spell" : "Ability";
    if (asDraft) {
      toast.success("Draft saved!", {
        description: `Your ${category} has been saved as a draft.`,
      });
    } else {
      toast.success(`${typeLabel} published!`, {
        description: `Your ${category} is now available in the community library.`,
      });
    }
    router.push("/homebrew");
  };

  const handleSaveClass = (
    name: string,
    description: string,
    data: ClassData,
    tags: string[],
    asDraft?: boolean
  ) => {
    // TODO: Call API to save
    console.log("Saving class:", { name, description, data, tags }, asDraft);
    if (asDraft) {
      toast.success("Draft saved!", {
        description: "Your class has been saved as a draft.",
      });
    } else {
      toast.success("Class published!", {
        description: "Your class is now available in the community library.",
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

      {/* Creator Component */}
      {category === "monster" && (
        <MonsterCreator
          onSave={handleSaveMonster}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {category === "item" && (
        <ItemCreator
          onSave={handleSaveItem}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {(category === "ability" || category === "spell") && (
        <AbilityCreator
          isSpell={category === "spell"}
          onSave={handleSaveAbility}
          onCancel={handleCancel}
          showPreview
        />
      )}

      {category === "class" && (
        <ClassCreator
          onSave={handleSaveClass}
          onCancel={handleCancel}
          showPreview
        />
      )}
    </div>
  );
}
