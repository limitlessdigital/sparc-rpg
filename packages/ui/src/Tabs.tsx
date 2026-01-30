import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Tabs component with SPARC design system styling
 * Accessible tabs with keyboard navigation
 * 
 * @example
 * ```tsx
 * <Tabs value={activeTab} onChange={setActiveTab}>
 *   <TabList>
 *     <Tab value="overview">Overview</Tab>
 *     <Tab value="characters">Characters (4)</Tab>
 *     <Tab value="settings">Settings</Tab>
 *   </TabList>
 *   <TabPanel value="overview">Overview content</TabPanel>
 *   <TabPanel value="characters">Characters content</TabPanel>
 *   <TabPanel value="settings">Settings content</TabPanel>
 * </Tabs>
 * ```
 */

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs provider");
  }
  return context;
}

export interface TabsProps {
  /** Currently active tab value (controlled) */
  value?: string;
  /** Default tab value (uncontrolled) */
  defaultValue?: string;
  /** Callback when tab changes */
  onChange?: (value: string) => void;
  /** Tab content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function Tabs({ value: controlledValue, defaultValue, onChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const value = controlledValue ?? internalValue;
  
  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "underline" | "pills";
}

export function TabList({
  variant = "underline",
  className,
  children,
  ...props
}: TabListProps) {
  const tabListRef = React.useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([disabled])'
    );
    if (!tabs) return;

    const currentIndex = Array.from(tabs).findIndex(
      (tab) => tab === document.activeElement
    );

    let nextIndex: number | undefined;

    switch (e.key) {
      case "ArrowLeft":
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case "ArrowRight":
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
    }

    if (nextIndex !== undefined) {
      e.preventDefault();
      tabs[nextIndex].focus();
    }
  };

  const variants = {
    underline: "border-b border-surface-divider",
    pills: "bg-surface-elevated p-1 rounded-lg",
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide",
        variants[variant],
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<TabProps>, {
            variant,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value for this tab */
  value: string;
  /** Visual variant (inherited from TabList) */
  variant?: "underline" | "pills";
}

export function Tab({
  value,
  variant = "underline",
  className,
  children,
  disabled,
  ...props
}: TabProps) {
  const { value: selectedValue, onChange } = useTabsContext();
  const isSelected = selectedValue === value;

  const baseStyles =
    "px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50";

  const variants = {
    underline: cn(
      "border-b-2 -mb-px",
      isSelected
        ? "text-bronze border-bronze"
        : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted"
    ),
    pills: cn(
      "rounded-md",
      isSelected
        ? "bg-surface-card text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-surface-card/50"
    ),
  };

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value that must match active tab to show this panel */
  value: string;
  /** Whether to keep panel mounted when inactive (for preserving state) */
  keepMounted?: boolean;
}

export function TabPanel({
  value,
  keepMounted = false,
  className,
  children,
  ...props
}: TabPanelProps) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={value}
      hidden={!isSelected}
      className={cn(
        "mt-4 focus:outline-none",
        isSelected && "animate-fade-in",
        className
      )}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

// Aliases for compatibility with shadcn/radix naming convention
export { TabList as TabsList };
export { Tab as TabsTrigger };
export { TabPanel as TabsContent };
