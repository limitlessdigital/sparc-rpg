import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Toast/Notification system with SPARC design system styling
 * 
 * Usage:
 * 1. Wrap your app with <ToastProvider>
 * 2. Use the useToast hook to show toasts
 * 
 * @example
 * ```tsx
 * // In your component
 * const { toast } = useToast();
 * toast.success("Character saved!");
 * toast.error("Failed to save", { action: { label: "Retry", onClick: retry } });
 * ```
 */

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
  icon?: React.ReactNode;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    (options: Omit<ToastData, "id" | "variant">): string;
    success: (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) => string;
    error: (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) => string;
    warning: (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) => string;
    info: (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) => string;
  };
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  /** Position of the toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  /** Default duration for toasts in ms */
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = toast.duration ?? defaultDuration;

      setToasts((prev) => [...prev, { ...toast, id }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    [defaultDuration]
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(() => {
    const toastFn = (options: Omit<ToastData, "id" | "variant">) =>
      addToast({ ...options, variant: "default" });

    toastFn.success = (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) =>
      addToast({ title, variant: "success", ...options });

    toastFn.error = (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) =>
      addToast({ title, variant: "error", ...options });

    toastFn.warning = (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) =>
      addToast({ title, variant: "warning", ...options });

    toastFn.info = (title: string, options?: Partial<Omit<ToastData, "id" | "variant" | "title">>) =>
      addToast({ title, variant: "info", ...options });

    return toastFn;
  }, [addToast]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast viewport */}
      <div
        className={cn(
          "fixed z-toast flex flex-col gap-3 w-full max-w-[420px] pointer-events-none",
          positionClasses[position]
        )}
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <Toast key={t.id} data={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastProps {
  data: ToastData;
  onClose: () => void;
}

function Toast({ data, onClose }: ToastProps) {
  const { variant, title, description, action, icon } = data;

  const variantStyles = {
    default: "border-l-surface-divider",
    success: "border-l-success",
    error: "border-l-error",
    warning: "border-l-warning",
    info: "border-l-info",
  };

  const defaultIcons: Record<ToastVariant, React.ReactNode> = {
    default: null,
    success: (
      <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 pointer-events-auto",
        "bg-surface-elevated border border-surface-divider border-l-4 rounded-lg",
        "shadow-lg animate-slide-up",
        variantStyles[variant]
      )}
      role="alert"
    >
      {(icon || defaultIcons[variant]) && (
        <div className="flex-shrink-0">{icon || defaultIcons[variant]}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-bronze hover:text-bronze-600 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 text-muted hover:text-foreground transition-colors rounded"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
