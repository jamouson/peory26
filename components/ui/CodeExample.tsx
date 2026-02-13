import { Badge } from "../Badge"
import CodeExampleTabs from "./CodeExampleTabs"

export default function CodeExample() {
  return (
    <section
      aria-labelledby="code-example-title"
      className="mx-auto mt-28 w-full max-w-6xl px-3 text-center"
    >
      <Badge>Developer-first</Badge>
      <h2
        id="code-example-title"
        className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
      >
        From Concept <br /> to Centerpiece
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Creating your perfect wedding cake is a collaborative journey. We
        combine traditional techniques with innovative designs to create true
        showstopper cakes.
      </p>

      <CodeExampleTabs
        tab1={
          /* Tab 1 Content: Buttercream Flowers Image */
          <div className="h-[31rem] w-full overflow-hidden rounded-xl border border-gray-200 shadow-2xl dark:border-gray-800">
            <img
              src="https://placehold.co/800x1000/png?text=Buttercream+Flowers"
              alt="Detailed buttercream flowers"
              className="h-full w-full object-cover"
            />
          </div>
        }
        tab2={
          /* Tab 2 Content: Personalized Design Image */
          <div className="h-[31rem] w-full overflow-hidden rounded-xl border border-gray-200 shadow-2xl dark:border-gray-800">
            <img
              src="https://placehold.co/800x1000/png?text=Sketch+Design"
              alt="Cake design sketch"
              className="h-full w-full object-cover"
            />
          </div>
        }
      />
    </section>
  )
}