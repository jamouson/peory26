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
//
// ┌──────────────┬─────────┬─────────┐
// │  Chocolate   │Blueberry│  Lemon  │
// │   (2x2)      │         │         │
// │              ├─────────┼─────────┤
// │              │ Caramel │  Matcha │
// ├─────────┬────┴────┬────┴───┬─────┤
// │ Vanilla │Strawb.  │Raspb.  │Earl │
// └─────────┴─────────┴────────┴─────┘
// ---------------------------------------------------------------------------

const bentoPositions = [
  { colSpan: "sm:col-span-2", rowSpan: "sm:row-span-2", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
  { colSpan: "sm:col-span-1", rowSpan: "sm:row-span-1", height: "h-48 sm:h-full" },
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
      className={`flavor-card group/flavor relative overflow-hidden rounded-2xl ${position.colSpan} ${position.rowSpan} ${position.height}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <img
        src={flavor.image}
        alt={flavor.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover/flavor:scale-105"
      />

      {/* Default — title at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-12 transition-opacity duration-300 group-hover/flavor:opacity-0">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {flavor.title}
        </h3>
      </div>

      {/* Hover — full overlay with description */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-black/10 p-4 opacity-0 transition-opacity duration-300 ease-out group-hover/flavor:opacity-100">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {flavor.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/75">
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
          animation: fade-up 0.5s ease-out forwards;
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

        {/* Bento Grid */}
        <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-3 sm:mt-14 sm:auto-rows-[200px] sm:grid-cols-4">
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