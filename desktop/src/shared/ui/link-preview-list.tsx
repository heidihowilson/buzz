import { useState } from "react";

import type { ResolvedLinkPreview } from "@/shared/lib/useResolvedLinkPreviews";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { AttachmentGroup } from "@/shared/ui/attachment";
import { Button } from "@/shared/ui/button";
import { LinkPreviewAttachment } from "@/shared/ui/link-preview-attachment";

export function LinkPreviewList({
  onRemoveForEveryone,
  previews,
}: {
  onRemoveForEveryone?: () => Promise<void>;
  previews: ResolvedLinkPreview[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  if (removed || previews.length === 0) return null;

  const previewNoun = previews.length === 1 ? "preview" : "previews";
  return (
    <>
      <AttachmentGroup
        className="max-w-full flex-col items-start overflow-visible pb-0"
        data-link-preview-list=""
      >
        {previews.map((preview, index) => (
          <LinkPreviewAttachment
            key={preview.href}
            onRemove={
              onRemoveForEveryone && index === 0
                ? () => setDialogOpen(true)
                : undefined
            }
            preview={preview}
          />
        ))}
      </AttachmentGroup>
      {onRemoveForEveryone ? (
        <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Remove {previewNoun} for everyone?
              </AlertDialogTitle>
              <AlertDialogDescription>
                No one will see{" "}
                {previews.length === 1 ? "the preview" : "the previews"} on this
                message anymore.{" "}
                {previews.length === 1
                  ? "The link itself will stay"
                  : "The links themselves will stay"}{" "}
                in the message. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={() => {
                    setRemoved(true);
                    void onRemoveForEveryone().catch(() => setRemoved(false));
                  }}
                  type="button"
                  variant="destructive"
                >
                  Remove {previewNoun}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
