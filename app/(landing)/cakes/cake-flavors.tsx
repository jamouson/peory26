"use client"

import useEmblaCarousel from "embla-carousel-react"

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
// Flavor Card
// ---------------------------------------------------------------------------

function FlavorCard({
  flavor,
  index,
}: {
  flavor: (typeof flavors)[0]
  index: number
}) {
  return (
    <div
      className="flavor-card group/flavor relative h-[400px] w-[280px] flex-none overflow-hidden rounded-[2.5rem] border border-white/10 sm:h-[500px] sm:w-[380px]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <img
        src={flavor.image}
        alt={flavor.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out pointer-events-none group-hover/flavor:scale-105"
      />

      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none group-hover/flavor:bg-black/50" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end p-6 sm:p-8">
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {flavor.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80 opacity-0 transition-opacity duration-300 group-hover/flavor:opacity-100">
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
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    direction: "rtl",
  })

  return (
    <>
      <style>{`
        .flavor-card {
          opacity: 0;
          animation: slide-from-left 1s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }

        @keyframes slide-from-left {
          from { opacity: 0; transform: translateX(-120px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .embla-flavors {
          overflow: hidden;
          cursor: grab;
        }
        .embla-flavors:active {
          cursor: grabbing;
        }
        .embla-flavors__container {
          display: flex;
          gap: 1.5rem;
          padding-right: max(1.5rem, calc((100vw - 1152px) / 2 + 1.5rem));
          padding-left: max(1.5rem, calc((100vw - 1152px) / 2 + 1.5rem));
        }
      `}</style>

      <section className="py-24 sm:py-32 overflow-hidden bg-transparent">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="text-right">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Flavors & Fillings
            </h2>
            <p className="ml-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Our cakes offer classic and unique flavors, made with premium ingredients.
            </p>
          </div>
        </div>

        <div className="embla-flavors" ref={emblaRef} dir="rtl">
          <div className="embla-flavors__container pb-12">
            {flavors.map((flavor, i) => (
              <div key={flavor.id} dir="ltr">
                <FlavorCard flavor={flavor} index={i} />
              </div>
            ))}
            <div className="w-10 flex-none sm:w-20" />
          </div>
        </div>
      </section>
    </>
  )
}