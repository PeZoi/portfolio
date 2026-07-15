import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class Tailwind một cách an toàn, tự động resolve các conflict */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
