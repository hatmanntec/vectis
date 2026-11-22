import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind class names and resolves conflicts
 * (e.g. cn("px-2", condition && "px-4") keeps only "px-4").
 * Used by every shadcn/ui component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
