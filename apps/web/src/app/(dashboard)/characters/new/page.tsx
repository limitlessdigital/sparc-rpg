"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, useToast
} from "@sparc/ui";
import type { SPARCClass } from "@sparc/ui";
import { characterService, type CharacterClass } from "@/lib/supabase";

// Local components
import { 
  ClassCard, 
  ClassPreviewPanel, 
  CharacterPreviewCard, 
  ProgressIndicator,
  NameInput 
} from "./components";
import { 
  CLASS_DEFINITIONS, 
  validateCharacterName,
  formatCharacterName,
  type ClassDefinition 
} from "./class-data";

// Wizard steps
type Step = "class" | "name" | "review" | "success";

const WIZARD_STEPS: { key: Step; label: string }[] = [
  { key: "class", label: "Choose Class" },
  { key: "name", label: "Name Hero" },
  { key: "review", label: "Review" },
];

// Character creation state
interface WizardState {
  step: Step;
  selectedClass: SPARCClass | null;
  characterName: string;
  isNameValid: boolean;
}

const initialState: WizardState = {
  step: "class",
  selectedClass: null,
  characterName: "",
  isNameValid: false,
};

/**
 * Character Creation Wizard
 * PRD 13: Production-ready character creation flow
 */
export default function NewCharacterPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();

  // Wizard state
  const [state, setState] = React.useState<WizardState>(initialState);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Preview state
  const [previewClass, setPreviewClass] = React.useState<SPARCClass | null>(null);
  const [showMobilePreview, setShowMobilePreview] = React.useState(false);

  // Get class data
  const selectedClassData = state.selectedClass 
    ? CLASS_DEFINITIONS[state.selectedClass] 
    : null;
  const previewClassData = previewClass 
    ? CLASS_DEFINITIONS[previewClass] 
    : null;

  // Navigation
  const goToStep = (step: Step) => {
    setState((s) => ({ ...s, step }));
  };

  const nextStep = () => {
    const steps: Step[] = ["class", "name", "review"];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["class", "name", "review"];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  };

  // Can proceed to next step?
  const canProceed = (): boolean => {
    switch (state.step) {
      case "class":
        return state.selectedClass !== null;
      case "name":
        return state.isNameValid;
      case "review":
        return true;
      default:
        return false;
    }
  };

  // Handle class selection
  const handleSelectClass = (classId: SPARCClass) => {
    setState((s) => ({ ...s, selectedClass: classId }));
    setPreviewClass(classId);
    setShowMobilePreview(false);
  };

  // Handle mobile tap to preview
  const handleMobileTap = (classId: SPARCClass) => {
    if (state.selectedClass === classId) {
      // Already selected, proceed
      nextStep();
    } else {
      // Show preview
      setPreviewClass(classId);
      setShowMobilePreview(true);
    }
  };

  // Handle name change
  const handleNameChange = (name: string) => {
    setState((s) => ({ ...s, characterName: name }));
  };

  // Handle name validation
  const handleNameValidation = (isValid: boolean) => {
    setState((s) => ({ ...s, isNameValid: isValid }));
  };

  // Create character
  const handleCreate = async () => {
    if (!state.selectedClass || !state.characterName.trim()) return;

    // Final validation
    const validation = validateCharacterName(state.characterName);
    if (!validation.valid) {
      toast.error("Invalid Name", { description: validation.error });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedName = formatCharacterName(state.characterName);
      const classData = CLASS_DEFINITIONS[state.selectedClass];
      
      // Create the character in Supabase
      await characterService.create(
        formattedName, 
        state.selectedClass as CharacterClass
      );

      // Show success
      goToStep("success");
      toast.success("Character Created!", {
        description: `${formattedName} the ${classData.name} is ready for adventure!`,
      });

      // Redirect after delay
      setTimeout(() => {
        router.push("/characters");
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error("Creation Failed", {
        description: message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <Card className="overflow-visible">
        <CardHeader className="text-center">
          <CardTitle as="h1" className="text-2xl md:text-3xl">
            Create New Character
          </CardTitle>
          <CardDescription>
            Build your hero and prepare for adventure
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 md:space-y-8">
          {/* Progress indicator */}
          {state.step !== "success" && (
            <ProgressIndicator
              steps={WIZARD_STEPS}
              currentStep={state.step}
              className="mb-8"
            />
          )}

          {/* Step 1: Class Selection */}
          {state.step === "class" && (
            <ClassSelectionStep
              selectedClass={state.selectedClass}
              previewClass={previewClass}
              previewClassData={previewClassData}
              showMobilePreview={showMobilePreview}
              onSelectClass={handleSelectClass}
              onSetPreviewClass={setPreviewClass}
              onMobileTap={handleMobileTap}
              onCloseMobilePreview={() => setShowMobilePreview(false)}
            />
          )}

          {/* Step 2: Name Entry */}
          {state.step === "name" && selectedClassData && (
            <NameEntryStep
              classData={selectedClassData}
              name={state.characterName}
              onNameChange={handleNameChange}
              onValidate={handleNameValidation}
            />
          )}

          {/* Step 3: Review */}
          {state.step === "review" && selectedClassData && (
            <ReviewStep
              name={state.characterName}
              classData={selectedClassData}
              onEditName={() => goToStep("name")}
              onEditClass={() => goToStep("class")}
            />
          )}

          {/* Success */}
          {state.step === "success" && selectedClassData && (
            <SuccessStep
              name={formatCharacterName(state.characterName)}
              classData={selectedClassData}
            />
          )}
        </CardContent>

        {/* Navigation */}
        {state.step !== "success" && (
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={state.step === "class" ? () => router.back() : prevStep}
              disabled={isSubmitting}
            >
              {state.step === "class" ? "Cancel" : "← Back"}
            </Button>

            {state.step === "review" ? (
              <Button
                data-testid="create-character-button"
                variant="primary"
                size="lg"
                onClick={handleCreate}
                loading={isSubmitting}
              >
                Create Character
              </Button>
            ) : (
              <Button
                data-testid="continue-button"
                variant="primary"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Continue →
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// ============================================
// Step Components
// ============================================

interface ClassSelectionStepProps {
  selectedClass: SPARCClass | null;
  previewClass: SPARCClass | null;
  previewClassData: ClassDefinition | null;
  showMobilePreview: boolean;
  onSelectClass: (classId: SPARCClass) => void;
  onSetPreviewClass: (classId: SPARCClass | null) => void;
  onMobileTap: (classId: SPARCClass) => void;
  onCloseMobilePreview: () => void;
}

function ClassSelectionStep({
  selectedClass,
  previewClass,
  previewClassData,
  showMobilePreview,
  onSelectClass,
  onSetPreviewClass,
  onMobileTap,
  onCloseMobilePreview,
}: ClassSelectionStepProps) {
  const classEntries = Object.entries(CLASS_DEFINITIONS) as [SPARCClass, ClassDefinition][];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-semibold">Choose Your Class</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Each class has unique strengths, abilities, and starting equipment
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Class grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {classEntries.map(([classId, classData]) => (
              <ClassCard
                key={classId}
                classData={classData}
                selected={selectedClass === classId}
                onSelect={() => onSelectClass(classId)}
                onShowPreview={() => onSetPreviewClass(classId)}
                onTapToPreview={() => onMobileTap(classId)}
              />
            ))}
          </div>
        </div>

        {/* Desktop preview panel */}
        <div className="hidden lg:block w-96">
          {previewClassData ? (
            <ClassPreviewPanel
              classData={previewClassData}
              onSelect={() => onSelectClass(previewClass!)}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-surface-divider rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                Hover over a class to see details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile preview modal */}
      {showMobilePreview && previewClassData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end lg:hidden">
          <div className="w-full max-h-[85vh] overflow-y-auto">
            <ClassPreviewPanel
              classData={previewClassData}
              onSelect={() => {
                onSelectClass(previewClass!);
                onCloseMobilePreview();
              }}
              onClose={onCloseMobilePreview}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface NameEntryStepProps {
  classData: ClassDefinition;
  name: string;
  onNameChange: (name: string) => void;
  onValidate: (isValid: boolean) => void;
}

function NameEntryStep({
  classData,
  name,
  onNameChange,
  onValidate,
}: NameEntryStepProps) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-semibold">Name Your Hero</h2>
        <p className="text-sm text-muted-foreground mt-1">
          What shall this {classData.name.toLowerCase()} be called?
        </p>
      </div>

      {/* Selected class summary */}
      <div className="flex items-center justify-center gap-4 p-4 bg-surface-elevated rounded-xl border border-surface-divider">
        <div className="w-12 h-12 rounded-lg bg-[#2a5a8a] border border-[#3a6a9a] flex items-center justify-center p-2">
          <img src={classData.icon} alt={classData.name} className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <p className="font-medium">{classData.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {classData.tagline}
          </p>
        </div>
      </div>

      {/* Name input with suggestions */}
      <NameInput
        value={name}
        onChange={onNameChange}
        onValidate={onValidate}
        autoFocus
      />
    </div>
  );
}

interface ReviewStepProps {
  name: string;
  classData: ClassDefinition;
  onEditName: () => void;
  onEditClass: () => void;
}

function ReviewStep({
  name,
  classData,
  onEditName,
  onEditClass,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-semibold">Review Your Character</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm your character before finalizing
        </p>
      </div>

      {/* Character preview card */}
      <div className="max-w-lg mx-auto">
        <CharacterPreviewCard
          name={formatCharacterName(name)}
          classData={classData}
        />
      </div>

      {/* Edit buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={onEditClass}>
          ← Change Class
        </Button>
        <Button variant="ghost" size="sm" onClick={onEditName}>
          ← Edit Name
        </Button>
      </div>
    </div>
  );
}

interface SuccessStepProps {
  name: string;
  classData: ClassDefinition;
}

function SuccessStep({ name, classData }: SuccessStepProps) {
  const router = useRouter();

  return (
    <div className="text-center py-8 space-y-6">
      <div className="relative inline-block">
        <div className="text-7xl animate-bounce">{classData.icon}</div>
        <div className="absolute -top-2 -right-2 text-4xl">🎉</div>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Character Created!</h2>
        <p className="text-lg text-muted-foreground">
          <span className="font-semibold text-foreground">{name}</span> the{" "}
          <span className="text-bronze">{classData.name}</span> is ready for adventure!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <Button variant="primary" size="lg" onClick={() => router.push("/sessions")}>
          Join a Session
        </Button>
        <Button variant="ghost" onClick={() => router.push("/characters/new")}>
          Create Another
        </Button>
      </div>

      <p className="text-sm text-muted-foreground animate-pulse">
        Redirecting to characters page...
      </p>
    </div>
  );
}
