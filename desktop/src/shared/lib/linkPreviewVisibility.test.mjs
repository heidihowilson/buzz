import assert from "node:assert/strict";
import test from "node:test";

import { readDismissedLinkPreviews } from "./linkPreviewVisibility.ts";

test("dismissed preview storage rejects malformed entries", () => {
  const storage = {
    getItem: () =>
      JSON.stringify([
        null,
        { messageId: 1, dismissedAt: "bad" },
        { messageId: "message-a", dismissedAt: 2 },
      ]),
  };
  assert.deepEqual(readDismissedLinkPreviews(storage), [
    { messageId: "message-a", dismissedAt: 2 },
  ]);
});
