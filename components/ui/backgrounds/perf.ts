// =============================================================================
// File: src/components/ui/backgrounds/perf.ts
// Description: Shared performance constants for background components.
//   Centralizes GPU-promotion so every background gets the same
//   optimizations without duplicating class strings.
// =============================================================================

/**
 * Base classes for the outermost wrapper of every background.
 * - `fixed inset-0 -z-10` — viewport-pinned, behind content
 * - `pointer-events-none` — click-through
 * - `overflow-hidden` — clips any oversized SVG layers
 */
export const BG_BASE =
  "pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden"

/**
 * Inline styles applied to the outermost wrapper.
 * - `willChange: transform` — promotes to own GPU compositor layer so
 *   blend modes and opacity changes composite without main-thread repaints
 * - `backfaceVisibility: hidden` — lightweight GPU-promotion hint
 */
export const BG_STYLE: React.CSSProperties = {
  willChange: "transform",
  backfaceVisibility: "hidden",
}