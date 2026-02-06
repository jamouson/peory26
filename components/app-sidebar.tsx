// =============================================================================
// File: src/components/app-sidebar.tsx
// Description: Main dashboard sidebar navigation for e-commerce admin.
//   UPDATED: Products link now points to /products instead of /dashboard/products.
// =============================================================================

"use client"

import * as React from "react"
import {
  IconChartBar, IconDashboard, IconHelp, IconInnerShadowTop,
  IconPackage, IconSearch, IconSettings, IconShoppingCart,
  IconTag, IconTruck, IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Products", url: "/products", icon: IconPackage },
    { title: "Variations", url: "/dashboard/variations", icon: IconTag },
    { title: "Orders", url: "/dashboard/orders", icon: IconShoppingCart },
    { title: "Customers", url: "/dashboard/customers", icon: IconUsers },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
  ],
  navSecondary: [
    { title: "Shipping", url: "/dashboard/shipping", icon: IconTruck },
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = {
    name: user?.fullName ?? user?.firstName ?? "User",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    avatar: user?.imageUrl ?? "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Peory</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
