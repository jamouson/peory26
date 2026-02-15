// =============================================================================
// File: src/components/ui/backgrounds/perf.ts
// Description: Shared performance constants for background components.
//   Centralizes GPU-promotion and containment so every background gets
//   the same optimizations without duplicating class strings.
// =============================================================================

/**
 * Base classes for the outermost wrapper of every background.
 * - `fixed inset-0 -z-10` — viewport-pinned, behind content
 * - `pointer-events-none` — click-through
 * - `will-change-transform` — promotes to own GPU compositor layer
 * - `overflow-hidden` — clips any oversized SVG layers
 */
export const BG_BASE =
  "pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden will-change-transform"

/**
 * Inline styles applied to the outermost wrapper.
 * - `contain` isolates layout/style/paint so the browser never needs
 *   to recalculate anything outside this subtree when backgrounds render.
 * - `backfaceVisibility` is a lightweight GPU-promotion hint.
 */
export const BG_STYLE: React.CSSProperties = {
  contain: "strict",
  backfaceVisibility: "hidden",
}
