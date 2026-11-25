/* Extracted from ryOS src/hooks/useWindowViewportConstraints.ts, commit e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35.
 * Copyright (C) 2025 Ryo Lu. AGPL-3.0-only.
 * Modified 2026-11-24: global store callback becomes explicit typed game adapter callback.
 * Game passes the usable workspace as bounds. See THIRD_PARTY_NOTICES.md. */
import { useEffect } from "react";


/**
 * One viewport listener for every open window. Resize events are coalesced
 * to a single animation frame, then written as one store update.
 */
export function subscribeWindowViewportConstraints(
  onChange: () => void,
): () => void {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return () => {};
  }

  let frame = 0;
  let lastViewportKey = "";
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const key = `${window.innerWidth}|${window.innerHeight}`;
      if (key === lastViewportKey) return;
      lastViewportKey = key;
      onChange();
    });
  };

  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  const media = window.matchMedia?.("(hover: none) and (pointer: coarse)");
  media?.addEventListener("change", schedule);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("resize", schedule);
    media?.removeEventListener("change", schedule);
  };
}

export function useWindowViewportConstraints(onChange: () => void) {
  useEffect(() => subscribeWindowViewportConstraints(onChange), [onChange]);
}
