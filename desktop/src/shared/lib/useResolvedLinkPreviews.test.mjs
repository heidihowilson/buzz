import assert from "node:assert/strict";
import test from "node:test";

import { resolveLinkPreview } from "./useResolvedLinkPreviews.ts";

const preview = {
  kind: "generic-link",
  href: "https://example.com/story",
  provider: "example.com",
  title: "example.com/story",
  typeLabel: "link",
};

test("pending metadata reserves the image treatment", () => {
  assert.deepEqual(resolveLinkPreview(preview, undefined), {
    ...preview,
    imageState: "pending",
  });
});

test("resolved image metadata keeps the reserved image treatment", () => {
  const resolved = resolveLinkPreview(preview, {
    title: "A story",
    siteName: "Example",
    imageDataUrl: "data:image/jpeg;base64,abc",
    imageDomain: "cdn.example.com",
  });

  assert.equal(resolved.imageState, "image");
  assert.equal(resolved.provider, "Example");
  assert.equal(resolved.imageDomain, "cdn.example.com");
});

test("resolved metadata without a complete image collapses to the compact treatment", () => {
  const resolved = resolveLinkPreview(preview, {
    title: "A story",
    siteName: "Example",
    imageDataUrl: null,
    imageDomain: null,
  });

  assert.equal(resolved.imageState, "none");
  assert.equal(resolved.imageDataUrl, null);
  assert.equal(resolved.imageDomain, null);
});
