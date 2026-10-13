import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Coupe un titre en `n` lignes équilibrées (aux espaces) pour les animations ligne par ligne. */
export function splitLines(text: string, n = 2) {
  const words = text.split(" ");
  if (words.length <= 1 || n <= 1) return [text];
  const target = text.length / n;
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && next.length > target * 1.08 && lines.length < n - 1) { lines.push(cur); cur = w; } else cur = next;
  }
  lines.push(cur);
  return lines;
}
