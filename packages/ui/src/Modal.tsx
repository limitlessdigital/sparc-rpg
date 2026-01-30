import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Modal/Dialog component with SPARC design system styling
 * Uses native HTML dialog element for accessibility
 * 
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={handleClose}>
 *   <ModalHeader>
 *     <ModalTitle>Confirm Action</ModalTitle>
 *     <ModalClose onClick={handleClose} />
 *   </ModalHeader>
 *   <ModalBody>Are you sure?</ModalBody>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Additional class names for the modal container */
  className?: string;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Close modal when clicking outside */
  closeOnOutsideClick?: boolean;
  /** Close modal when pressing Escape */
  closeOnEscape?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  size = "md",
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Handle open/close state
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, closeOnEscape]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === dialogRef.current) {
      onClose();
    }
  };

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[90vw]",
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-modal p-4",
        "bg-transparent backdrop:bg-black/70",
        "w-full",
        sizes[size],
        "mx-auto my-auto",
        "focus:outline-none"
      )}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        if (closeOnEscape) onClose();
      }}
    >
      <div
        className={cn(
          "bg-surface-elevated border border-surface-divider rounded-xl",
          "max-h-[90vh] overflow-auto",
          "animate-scale-in",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalHeader({ className, children, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center",
        "px-6 py-4 border-b border-surface-divider",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ModalClose({ className, onClick, ...props }: ModalCloseProps) {
  return (
    <button
      type="button"
      className={cn(
        "p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-card",
        "transition-colors duration-fast",
        "focus:outline-none focus:ring-2 focus:ring-bronze/50",
        className
      )}
      onClick={onClick}
      aria-label="Close modal"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex justify-end gap-3",
        "px-6 py-4 border-t border-surface-divider",
        className
      )}
      {...props}
    />
  );
}
