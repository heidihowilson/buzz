import { setLocalStorageItemWithRecovery } from "@/shared/lib/localStorageQuota";

const STORAGE_KEY = "buzz-hidden-link-preview-images.v1";
const MAX_ENTRIES = 1_000;

type HiddenPreviewImage = { key: string; hiddenAt: number };

export function linkPreviewImageKey(messageId: string, href: string): string {
  return `${messageId}:${href}`;
}

export function readHiddenPreviewImages(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): HiddenPreviewImage[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is HiddenPreviewImage =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as HiddenPreviewImage).key === "string" &&
          typeof (entry as HiddenPreviewImage).hiddenAt === "number",
      )
      .slice(-MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function hidePreviewImage(key: string): void {
  const entries = readHiddenPreviewImages().filter(
    (entry) => entry.key !== key,
  );
  entries.push({ key, hiddenAt: Date.now() });
  setLocalStorageItemWithRecovery(
    STORAGE_KEY,
    JSON.stringify(entries.slice(-MAX_ENTRIES)),
  );
}
