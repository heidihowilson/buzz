import { setLocalStorageItemWithRecovery } from "@/shared/lib/localStorageQuota";

const STORAGE_KEY = "buzz-dismissed-link-previews.v1";
const MAX_ENTRIES = 1_000;

type DismissedPreview = { messageId: string; dismissedAt: number };

export function readDismissedLinkPreviews(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): DismissedPreview[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is DismissedPreview =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as DismissedPreview).messageId === "string" &&
          typeof (entry as DismissedPreview).dismissedAt === "number",
      )
      .slice(-MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function isLinkPreviewDismissed(messageId: string): boolean {
  return readDismissedLinkPreviews().some(
    (entry) => entry.messageId === messageId,
  );
}

export function setLinkPreviewDismissed(
  messageId: string,
  dismissed: boolean,
): void {
  const entries = readDismissedLinkPreviews().filter(
    (entry) => entry.messageId !== messageId,
  );
  if (dismissed) entries.push({ messageId, dismissedAt: Date.now() });
  setLocalStorageItemWithRecovery(
    STORAGE_KEY,
    JSON.stringify(entries.slice(-MAX_ENTRIES)),
  );
}
