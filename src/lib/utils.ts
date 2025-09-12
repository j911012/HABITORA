import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 最大挙上重量(RM)を計算
 * @param weight 重量
 * @param reps 回数
 * @returns 最大挙上重量
 */
export function calcRm(weight?: number | null, reps?: number | null) {
  if (!weight || !reps || weight <= 0 || reps <= 0) return null;

  const raw = weight * (1 + reps / 40);
  return Math.round(raw * 2) / 2;
}
