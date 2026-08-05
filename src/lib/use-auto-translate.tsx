"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./i18n";

// In-memory cache so we don't re-translate the same text twice in one session
const cache = new Map<string, string>();

const MAX_CHUNK_BYTES = 450; // stay safely under MyMemory's 500-byte limit

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

// Splits long text into chunks that each fit under the API's byte limit,
// preferring to break on paragraph/line breaks so translations read naturally.
function chunkText(text: string): string[] {
  if (byteLength(text) <= MAX_CHUNK_BYTES) return [text];

  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    const candidate = current ? current + "\n" + line : line;
    if (byteLength(candidate) > MAX_CHUNK_BYTES) {
      if (current) chunks.push(current);
      if (byteLength(line) > MAX_CHUNK_BYTES) {
        let remaining = line;
        while (byteLength(remaining) > MAX_CHUNK_BYTES) {
          let sliceEnd = Math.floor(MAX_CHUNK_BYTES / 2);
          while (byteLength(remaining.slice(0, sliceEnd)) > MAX_CHUNK_BYTES && sliceEnd > 1) {
            sliceEnd--;
          }
          chunks.push(remaining.slice(0, sliceEnd));
          remaining = remaining.slice(sliceEnd);
        }
        current = remaining;
      } else {
        current = line;
      }
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(chunk: string): Promise<string> {
  if (cache.has(chunk)) return cache.get(chunk)!;
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=id|en`
  );
  const data = await res.json();
  const result = data?.responseData?.translatedText;
  if (result && typeof result === "string") {
    cache.set(chunk, result);
    return result;
  }
  return chunk;
}

/**
 * Auto-translates admin-entered content (product names, descriptions, hero
 * text, etc.) to English on the fly when the site is in EN mode, using the
 * free MyMemory translation API. Falls back silently to the original text
 * if the request fails, so the page never breaks. Long text is split into
 * chunks to respect the API's 500-byte-per-request limit.
 *
 * Static UI labels (buttons, menus) do NOT use this — those switch instantly
 * via the dictionary in i18n.tsx. This hook is only for content the store
 * owner typed into the admin panel.
 */
export function useAutoTranslate(text: string): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (lang === "id" || !text || !text.trim()) {
      setTranslated(text);
      return;
    }

    if (cache.has(text)) {
      setTranslated(cache.get(text)!);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const chunks = chunkText(text);
        const results = await Promise.all(chunks.map(translateChunk));
        const joined = results.join(chunks.length > 1 && text.includes("\n") ? "" : " ").trim();
        if (!cancelled && joined) {
          cache.set(text, joined);
          setTranslated(joined);
        }
      } catch {
        // silently keep showing the original text if the API fails
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, lang]);

  return lang === "en" ? translated : text;
}
