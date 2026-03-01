import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NameDetail } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 拼接姓 + 名，返回全名 */
export function fullName(name: NameDetail): string {
  return (name.lastName ?? '') + name.name
}
