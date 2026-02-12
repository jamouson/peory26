// =============================================================================
// File: src/app/(landing)/cakes/cake-flavors.tsx
// =============================================================================

"use client"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const flavors = [
  {
    id: "chocolate",
    title: "Chocolate",
    description:
      "Valrhona chocolate cake with Valrhona chocolate ganache buttercream",
    image: "https://media.peorycake.com/chocolate.webp",
  },
  {
    id: "blueberry",
    title: "Blueberry Mascarpone",
    description:
      "Genoise (sponge cake) with organic blueberry compote and mascarpone cream cheese frosting",
    image: "https://media.peorycake.com/blueberry.webp",
  },
  {
    id: "lemon",
    title: "Lemon",
    description:
      "Organic lemon cake with organic lemon curd and lemon curd buttercream",
    image: "https://media.peorycake.com/lemon.webp",
  },
  {
    id: "caramel",
    title: "Caramel",
    description:
      "Madagascar Vanilla bean Cake, Homemade Caramel Sauce buttercream",
    image: "https://media.peorycake.com/caramel.webp",
  },
  {
    id: "matcha",
    title: "Matcha",
    description:
      "Organic matcha cake with Organic matcha crème anglaise buttercream",
    image: "https://media.peorycake.com/greentea.webp",
  },
  {
    id: "vanilla",
    title: "Vanilla",
    description:
      "Madagascar Vanilla bean Cake with Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/vanilla.webp",
  },
  {
    id: "strawberry",
    title: "Strawberry",
    description:
      "Madagascar Vanilla bean Cake with organic strawberry compote and Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/strawberry.webp",
  },
  {
    id: "raspberry",
    title: "Raspberry",
    description:
      "Madagascar Vanilla bean Cake with organic raspberry compote and organic raspberry crème anglaise buttercream",
    image: "https://media.peorycake.com/raspberry.webp",
  },
  {
    id: "earlgrey",
    title: "Earl Grey",
    description:
      "Taylors of Harrogate Earl Grey Cake with Earl Grey jam and Earl Grey pâte à bombe buttercream",
    image: "https://media.peorycake.com/earlgrey.webp",
  },
]

// ---------------------------------------------------------------------------
// Bento positions — 4-col grid, 3 rows
// ---------------------------------------------------------------------------

const bentoPositions = [
  { colSpan: "sm:col-span-2", rowSpan: "sm:row-span-2", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-64 sm:h-full" },
]

// ---------------------------------------------------------------------------
// Flavor Card
// ---------------------------------------------------------------------------

function FlavorCard({
  flavor,
  position,
  index,
}: {
  flavor: (typeof flavors)[0]
  position: (typeof bentoPositions)[0]
  index: number
}) {
  return (
    <div
      // Mobile: 'sticky' positioning. Desktop: 'static' (default grid behavior).
      className={`flavor-card group/flavor relative overflow-hidden rounded-2xl border border-white/10 shadow-lg 
        sticky sm:static 
        ${position.colSpan} ${position.rowSpan} ${position.height}`}
      style={{
        // 1. Animation stagger
        animationDelay: `${index * 60}ms`,
        // 2. STACKING LOGIC (Mobile Only):
        //    top: 6rem (base offset for navbar) + (index * 10px) (creates the visible stack)
        //    zIndex: ensures later cards sit on top of earlier ones
        top: `calc(6rem + ${index * 10}px)`,
        zIndex: index + 10,
      }}
    >
      <img
        src={flavor.image}
        alt={flavor.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover/flavor:scale-105"
      />

      {/* Default — title at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 transition-opacity duration-300 group-hover/flavor:opacity-0">
        <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-md">
          {flavor.title}
        </h3>
      </div>

      {/* Hover — full overlay with description */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-black/20 p-5 opacity-0 transition-opacity duration-300 ease-out group-hover/flavor:opacity-100">
        <h3 className="text-lg font-bold tracking-tight text-white">
          {flavor.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {flavor.description}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CakeFlavors() {
  return (
    <>
      <style>{`
        .flavor-card {
          opacity: 0;
          animation: fade-up 0.6s ease-out forwards;
        }
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {/* Section header */}
        <div className="animate-fade-up text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Flavors & Fillings
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Our cakes offer classic and unique flavors, made with premium
            ingredients for an unforgettable taste. We use fresh, high-quality
            buttercream and fillings in every creation.
          </p>
        </div>

        {/* Container Layout:
          - Mobile: 'flex flex-col' allows the sticky items to stack naturally in a column.
          - Desktop: 'sm:grid' activates the Bento grid.
          - 'pb-24': Adds space at the bottom so the last card in the stack can be fully viewed.
        */}
        <div className="mt-12 flex flex-col gap-4 pb-24 sm:mt-14 sm:grid sm:auto-rows-[200px] sm:grid-cols-4 sm:gap-3 sm:pb-0">
          {flavors.map((flavor, i) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              position={bentoPositions[i]}
              index={i}
            />
          ))}
        </div>
      </section>
    </>
  )
}