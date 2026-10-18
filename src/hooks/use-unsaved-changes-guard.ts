import { useBlocker } from "@tanstack/react-router";

const MESSAGE = "You have unsaved changes. Leave without saving?";

/** Blocks in-app navigation and tab close while `dirty` is true. */
export function useUnsavedChangesGuard(dirty: boolean) {
  useBlocker({
    shouldBlockFn: () => dirty && !window.confirm(MESSAGE),
    enableBeforeUnload: dirty,
    disabled: !dirty,
  });
}

/** For dialogs/sheets: ask before discarding typed text. */
export const confirmDiscard = (dirty: boolean) =>
  !dirty || window.confirm("Discard what you typed?");
