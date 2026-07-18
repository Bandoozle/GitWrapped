import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared field styling for text inputs and textareas.
 * Uses `:focus` (not focus-visible) because clicking into a field should always
 * show the active state, with a subtle ring for stronger affordance.
 */
export const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 transition-[border-color,box-shadow] duration-150 ease-out outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input ref={ref} type={type} className={cn(fieldClass, className)} {...props} />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldClass, className)} {...props} />;
});
