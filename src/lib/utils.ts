import { Browser } from "@capacitor/browser";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
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

export function readableStreamToAsyncGen(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  return (async function* () {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  })();
}

export function asyncGenToReadableStream(gen: AsyncGenerator<Uint8Array>) {
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await gen.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },
    cancel() {
      gen.return?.(undefined);
    },
  });
}

export function encryptBlobV1(blob: Blob) {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const counter = crypto.getRandomValues(new Uint8Array(16));

  const key = new Uint8Array(1 + keyBytes.length + counter.length);
  key.set([1], 0); // version
  key.set(keyBytes, 1);
  key.set(counter, 1 + keyBytes.length);

  const reader = asyncGenToReadableStream(
    encryptStream(readableStreamToAsyncGen(blob.stream()), keyBytes, counter),
  );
  return { reader, key };
}

export function decryptBlobV1(blob: Blob, key: Uint8Array) {
  const version = key[0];
  if (version != 1) {
    throw Error(`unexpected key version: ${version}`);
  }
  const keyBytes = key.slice(1, 32 + 1);
  const counter = key.slice(32 + 1);

  const reader = asyncGenToReadableStream(
    decryptStream(readableStreamToAsyncGen(blob.stream()), keyBytes, counter),
  );

  return reader;
}

export async function* encryptStream(
  stream: AsyncGenerator<Uint8Array>,
  keyBytes: Uint8Array,
  counter: Uint8Array,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-CTR" },
    false,
    ["encrypt"],
  );

  let counterValue = new BigUint64Array(counter.buffer, 8, 1)[0]; // lower 64 bits for counting
  for await (const chunk of stream) {
    const counterBlock = counter.slice(); // copy
    new DataView(counterBlock.buffer).setBigUint64(8, counterValue, false); // update lower 64 bits
    counterValue += BigInt(Math.ceil(chunk.byteLength / 16));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CTR", counter: counterBlock, length: 64 },
      key,
      new Uint8Array(chunk),
    );
    yield new Uint8Array(encrypted);
  }
}

export async function* decryptStream(
  stream: AsyncGenerator<Uint8Array>,
  keyBytes: Uint8Array,
  counter: Uint8Array,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-CTR" },
    false,
    ["decrypt"],
  );

  let counterValue = new BigUint64Array(counter.buffer, 8, 1)[0]; // lower 64 bits for counting
  for await (const chunk of stream) {
    const counterBlock = counter.slice(); // copy
    new DataView(counterBlock.buffer).setBigUint64(8, counterValue, false); // update lower 64 bits
    counterValue += BigInt(Math.ceil(chunk.byteLength / 16));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CTR", counter: counterBlock, length: 64 },
      key,
      new Uint8Array(chunk),
    );
    yield new Uint8Array(decrypted);
  }
}

export function toBase64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function fromBase64(b64: string) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export const SIZE_LOOKUP_TABLE = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: "K" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "G" },
];

export const READABLE_LOOKUP_TABLE = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: "K" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "B" },
];
export function formatNumber(
  num: number,
  digits = 2,
  lookupTable = READABLE_LOOKUP_TABLE,
) {
  const lookup = lookupTable;
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}


export function launchBrowserUrl(url: string) {
  if (isTauri()) {
    open(url)
  } else {
    Browser.open({ url, windowName: "_self" })
  }
}