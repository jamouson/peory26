// =============================================================================
// File: src/app/(dashboard)/dashboard/page.tsx
// Description: Dashboard home page (overview with charts and stats).
//              UPDATED: Removed SidebarProvider/AppSidebar/SiteHeader wrappers
//              since they now live in layout.tsx. This page only renders content.
// =============================================================================

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  )
}
