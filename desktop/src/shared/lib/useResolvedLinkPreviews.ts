import * as React from "react";

import { invokeTauri } from "@/shared/api/tauri";

import type { SupportedLinkPreview } from "./linkPreview";

type LinkPreviewMetadata = {
  title: string;
  siteName: string | null;
  imageDataUrl: string | null;
  imageDomain: string | null;
};

const metadataCache = new Map<
  string,
  Promise<LinkPreviewMetadata | null> | LinkPreviewMetadata | null
>();

/** Clear ephemeral metadata when the active relay/community changes. */
export function resetLinkPreviewMetadataCache(): void {
  metadataCache.clear();
}

function fetchLinkPreviewMetadata(
  href: string,
): Promise<LinkPreviewMetadata | null> {
  return invokeTauri<LinkPreviewMetadata | null>(
    "fetch_link_preview_metadata",
    {
      href,
    },
  );
}

function cacheMetadata(href: string): Promise<LinkPreviewMetadata | null> {
  const cached = metadataCache.get(href);
  if (cached instanceof Promise) return cached;
  if (cached !== undefined) return Promise.resolve(cached);

  const promise = fetchLinkPreviewMetadata(href)
    .then((metadata) => {
      metadataCache.set(href, metadata);
      return metadata;
    })
    .catch(() => {
      metadataCache.set(href, null);
      return null;
    });
  metadataCache.set(href, promise);
  return promise;
}

export function useResolvedLinkPreviews(
  previews: SupportedLinkPreview[],
): SupportedLinkPreview[] {
  const [resolvedMetadata, setResolvedMetadata] = React.useState<
    Record<string, LinkPreviewMetadata>
  >({});

  React.useEffect(() => {
    let cancelled = false;

    for (const preview of previews) {
      const cached = metadataCache.get(preview.href);
      if (cached && !(cached instanceof Promise)) {
        setResolvedMetadata((current) =>
          current[preview.href] === cached
            ? current
            : { ...current, [preview.href]: cached },
        );
        continue;
      }

      void cacheMetadata(preview.href).then((metadata) => {
        if (cancelled || !metadata) return;
        setResolvedMetadata((current) =>
          current[preview.href] === metadata
            ? current
            : { ...current, [preview.href]: metadata },
        );
      });
    }

    return () => {
      cancelled = true;
    };
  }, [previews]);

  return React.useMemo(
    () =>
      previews.map((preview) => {
        const metadata = resolvedMetadata[preview.href];
        if (!metadata) return preview;
        return {
          ...preview,
          title: metadata.title,
          provider:
            preview.kind === "generic-link" && metadata.siteName
              ? metadata.siteName
              : preview.provider,
          imageDataUrl: metadata.imageDataUrl,
          imageDomain: metadata.imageDomain,
        };
      }),
    [previews, resolvedMetadata],
  );
}
