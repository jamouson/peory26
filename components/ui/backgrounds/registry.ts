// =============================================================================
// File: src/components/ui/backgrounds/registry.ts
// Description: Background component registry.
//   This is the ONLY file you edit when adding a new background type.
//   1. Import your component
//   2. Add one entry to the registry
// =============================================================================

import type { BackgroundRegistry } from "./types"
import { MarbleBackground } from "./marble-bg"
import { WaveBackground } from "./wave-bg"
import { SilkBackground } from "./silk-bg"
import { StuccoBackground } from "./stucco-bg"
import { TerrazzoBackground } from "./terrazzo-bg"

export const backgroundRegistry: BackgroundRegistry = {
  marble:   MarbleBackground,
  wave:     WaveBackground,
  silk:     SilkBackground,
  stucco:   StuccoBackground,
  terrazzo: TerrazzoBackground,
}
