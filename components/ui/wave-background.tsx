// =============================================================================
// File: src/components/ui/marble-background.tsx
// Description: "Dialed Up" Marble Background.
//   Changes:
//   1. Increased contrast in SVG (feColorMatrix) for sharper veins.
//   2. Increased opacity (0.12 -> 0.22) for better visibility.
//   3. Reduced spotlight intensity so texture shows through the center.
// =============================================================================

type MarbleVariant = "cool" | "warm";

// 1. THE VEINS (Sharpened)
// Changed matrix values from '25 -15' to '35 -20'. 
// This creates sharper, more defined "cracks" in the stone.
const sharpFlow = (color: string) => 
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.002 0.008' numOctaves='3' seed='15' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -20' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23noise)' opacity='0.7'/%3E%3C/svg%3E")`;

// 2. THE GRAIN (Micro-texture)
const grainTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`;

const variants: Record<MarbleVariant, {
  base: string;
  veinColor: string;
  veinOpacity: string;
  spotlight: string;
}> = {
  cool: {
    base: "#F8FAFC", 
    veinColor: "#64748b", // Slate 500 (Darker for contrast)
    veinOpacity: "0.18", // Up from 0.08
    // Spotlight is now 85% opacity (was 100%), letting texture show through slightly
    spotlight: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)"
  },
  warm: {
    base: "#FAFAF9", 
    veinColor: "#78716c", // Stone 500 (Darker for contrast)
    veinOpacity: "0.22", // Up from 0.12
    spotlight: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85) 10%, rgba(255,255,255,0) 80%)"
  }
};

export function MarbleBackground({ variant = "warm" }: { variant?: MarbleVariant }) {
  const v = variants[variant];

  return (
    <div 
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none select-none overflow-hidden"
      style={{ backgroundColor: v.base }}
    >
      {/* LAYER 1: The Veins (Sharper & Darker) */}
      <div 
        className="absolute inset-[-50%] h-[200%] w-[200%] origin-center"
        style={{
          backgroundImage: sharpFlow(v.veinColor),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: v.veinOpacity,
          transform: 'rotate(-12deg)',
        }}
      />

      {/* LAYER 2: The Spotlight (Softer) */}
      <div 
        className="absolute inset-0"
        style={{ background: v.spotlight }}
      />
      
      {/* LAYER 3: The Grain */}
      <div 
        className="absolute inset-0 mix-blend-multiply opacity-[0.2]"
        style={{ backgroundImage: grainTexture }}
      />
    </div>
  );
}