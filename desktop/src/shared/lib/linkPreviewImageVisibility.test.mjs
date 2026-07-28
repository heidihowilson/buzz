import assert from "node:assert/strict";
import test from "node:test";

import {
  linkPreviewImageKey,
  readHiddenPreviewImages,
} from "./linkPreviewImageVisibility.ts";

test("preview image visibility keys are scoped to message and link", () => {
  assert.notEqual(
    linkPreviewImageKey("message-a", "https://example.com"),
    linkPreviewImageKey("message-b", "https://example.com"),
  );
});

test("hidden preview storage rejects malformed entries", () => {
  const storage = {
    getItem: () =>
      JSON.stringify([
        null,
        { key: 1, hiddenAt: "bad" },
        { key: "ok", hiddenAt: 2 },
      ]),
  };
  assert.deepEqual(readHiddenPreviewImages(storage), [
    { key: "ok", hiddenAt: 2 },
  ]);
});
