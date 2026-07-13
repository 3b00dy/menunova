import clsx, { type ClassValue } from "clsx";

/**
 * Thin `clsx` wrapper — the project's only class merger (no `tailwind-merge`).
 * Last-class-wins conflicts are avoided by construction in the component recipes.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export type { ClassValue };
