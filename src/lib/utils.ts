import { clsx, type ClassValue } from "clsx";
import { CDN_STORAGE, DEFAULT_USER_ICON } from "lupyd-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userPfpSrc(username: string | null) {
  if (!username) return DEFAULT_USER_ICON;
  return `${CDN_STORAGE}/users/${username}`;
}
