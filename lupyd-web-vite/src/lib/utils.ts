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

export const lazyLoadObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        if (target.tagName == "IMG" || target.tagName == "VIDEO") {
          const element = target as HTMLImageElement | HTMLVideoElement;
          const src = element.dataset.src;
          if (src) {
            element.classList.remove("lazy");
            element.src = src;
            obs.unobserve(element);
          }
        }
      }
    });
  },
  { rootMargin: "50px" },
);
