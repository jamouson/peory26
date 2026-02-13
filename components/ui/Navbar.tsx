// =============================================================================
// File: components/ui/Navbar.tsx
// Description: Customer-facing navbar with shadcn NavigationMenu mega menu.
//   "Creations" opens a multi-column dropdown panel with product categories.
//   Wedding, Classes, FAQ are simple links. How to Order is the CTA.
//   Logo starts large (w-44) and shrinks (w-28) on scroll.
//   Logo has viewTransitionName for cross-page glide animation to auth pages.
//   FIX: Mobile overflow — logo yields (no shrink-0), actions stay rigid,
//        no overflow-x-hidden so dropdowns aren't clipped.
// =============================================================================

"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/use-scroll"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import { Link as TransitionLink } from "next-view-transitions"
import Link from "next/link"
import React from "react"
import { DatabaseLogo } from "@/components/icons/DatabaseLogo"
import { Button } from "../Button"
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"
import { CartIcon } from "@/components/cart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  IconUser,
  IconLayoutDashboard,
  IconShoppingBag,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

// =============================================================================
// UserDropdown
// =============================================================================
function UserDropdown() {
  const { user } = useUser()
  const { signOut } = useClerk()

  if (!user) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-full bg-gray-200 outline-none hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600">
          <IconUser className="size-4 text-gray-600 dark:text-gray-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.fullName || "User"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <IconLayoutDashboard className="mr-2 size-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders">
              <IconShoppingBag className="mr-2 size-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <IconLogout className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// =============================================================================
// ListItem — reusable link item inside the mega menu
// =============================================================================
const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { badge?: string }
>(({ className, title, children, badge, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href || "#"}
          className={cn(
            "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium leading-none">{title}</div>
            {badge && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {badge}
              </span>
            )}
          </div>
          {children && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

// =============================================================================
// Navigation — main exported component
// =============================================================================
export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)
  const [creationsOpen, setCreationsOpen] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => {
      setOpen(false)
      setCreationsOpen(false)
    }

    mediaQuery.addEventListener("change", handleMediaQueryChange)
    handleMediaQueryChange()

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
    }
  }, [])

  return (
    <header
      className={cx(
        "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center rounded-xl border border-transparent px-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open ? "h-auto" : scrolled ? "h-14" : "h-16",
        scrolled ? "py-2" : "py-3",
        "overflow-hidden md:overflow-visible",
        scrolled || open
          ? "border-gray-200/50 bg-white/80 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      {/* min-w-0 lets flex children shrink below content size — NO overflow-x-hidden */}
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between">
          {/* ─── Logo (shrinks on scroll) — tagged for view transition ─── */}
          {/* NO shrink-0 — logo is the flex item that yields on small screens */}
          <Link href="/" aria-label="Home" className="min-w-0">
            <span className="sr-only">Peory Cake</span>
            <div style={{ viewTransitionName: "peory-logo" }}>
              <DatabaseLogo
                className={cx(
                  "transition-all duration-300 ease-out",
                  "max-w-full",
                  scrolled
                    ? "h-7 w-auto sm:h-8 md:h-auto md:w-28"
                    : "h-8 w-auto sm:h-10 md:h-auto md:w-44"
                )}
              />
            </div>
          </Link>

          {/* ─── Desktop Navigation (mega menu) ─── */}
          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* ── Creations (mega menu dropdown) ── */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 data-[state=open]:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100 dark:data-[state=open]:bg-gray-800/60">
                    Creations
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] gap-3 p-4 md:grid-cols-[1fr_0.75fr_0.75fr]">
                      {/* Column 1: Featured Cakes card */}
                      <NavigationMenuLink asChild>
                        <Link
                          href={siteConfig.baseLinks.cakes}
                          className="group flex h-full flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none transition-colors hover:from-muted hover:to-muted/80 focus:shadow-md"
                        >
                          <div className="mb-1 text-lg font-semibold">
                            Cakes
                          </div>
                          <p className="text-sm leading-snug text-muted-foreground">
                            Our signature buttercream floral art cakes crafted
                            with premium organic ingredients.
                          </p>
                          <span className="mt-3 inline-flex text-xs font-medium text-primary group-hover:underline">
                            Explore Cakes →
                          </span>
                        </Link>
                      </NavigationMenuLink>

                      {/* Column 2: Products + Collections */}
                      <div className="space-y-1">
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Products
                        </p>
                        <ul className="space-y-0">
                          <ListItem href={siteConfig.baseLinks.cupcakes} title="Cupcakes">
                            Half &amp; full dozen
                          </ListItem>
                          <ListItem href={siteConfig.baseLinks.numberCakes} title="Number Cakes">
                            Single &amp; double digits
                          </ListItem>
                          <ListItem href={siteConfig.baseLinks.pure} title="PURE by Peory">
                            Pre-designed minimalist cakes
                          </ListItem>
                        </ul>
                      </div>

                      {/* Column 3: Collections + Info */}
                      <div className="space-y-1">
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Browse
                        </p>
                        <ul className="space-y-0">
                          <ListItem
                            href={siteConfig.baseLinks.collections}
                            title="Collections"
                            badge="Updated"
                          >
                            Browse all collections
                          </ListItem>
                          <ListItem href="/flavors" title="Flavors & Fillings">
                            Available options
                          </ListItem>
                          <ListItem href={siteConfig.baseLinks.pricing} title="Pricing">
                            Pricing details
                          </ListItem>
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* ── Simple links ── */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href={siteConfig.baseLinks.wedding}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent text-sm font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                      )}
                    >
                      Wedding
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href={siteConfig.baseLinks.classes}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent text-sm font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                      )}
                    >
                      Classes
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href={siteConfig.baseLinks.howToOrder}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent text-sm font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                      )}
                    >
                      How to Order
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href={siteConfig.baseLinks.faq}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent text-sm font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                      )}
                    >
                      FAQ
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ─── Desktop right side ─── */}
          <div className="hidden shrink-0 items-center gap-x-2 md:flex">
            <ModeToggle />
            <SignedIn>
              <CartIcon />
              <UserDropdown />
            </SignedIn>
            <SignedOut>
              {/* TransitionLink triggers view transition when navigating to auth */}
              <TransitionLink href="/sign-in">
                <Button>Inquiry Form</Button>
              </TransitionLink>
            </SignedOut>
          </div>

          {/* ─── Mobile right side ─── */}
          {/* shrink-0 keeps buttons rigid — logo yields instead */}
          <div className="flex shrink-0 items-center gap-x-1.5 md:hidden">
            <ModeToggle />
            <SignedIn>
              <CartIcon />
              <UserDropdown />
            </SignedIn>
            <SignedOut>
              <TransitionLink href="/sign-in">
                <Button className="px-2.5 text-xs sm:px-4 sm:text-sm">
                  Inquire
                </Button>
              </TransitionLink>
            </SignedOut>
            <Button
              onClick={() => {
                setOpen(!open)
                if (open) setCreationsOpen(false)
              }}
              variant="light"
              className="aspect-square p-2"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="size-5" />
              ) : (
                <RiMenuLine aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* ─── Mobile nav links ─── */}
        <nav
          className={cx(
            "my-4 flex flex-col text-base ease-in-out will-change-transform md:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-1 font-medium">
            {/* Creations — expandable section */}
            <li>
              <button
                onClick={() => setCreationsOpen(!creationsOpen)}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Creations</span>
                <IconChevronDown
                  className={cx(
                    "size-4 transition-transform duration-200",
                    creationsOpen ? "rotate-180" : ""
                  )}
                />
              </button>
              {creationsOpen && (
                <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.cakes}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      Cakes
                    </Link>
                  </li>
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.cupcakes}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      Cupcakes
                    </Link>
                  </li>
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.numberCakes}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      Number Cakes
                    </Link>
                  </li>
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.pure}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      PURE by Peory
                    </Link>
                  </li>
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.collections}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      Collections
                    </Link>
                  </li>
                  <li onClick={() => setOpen(false)}>
                    <Link
                      href={siteConfig.baseLinks.pricing}
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Simple links */}
            <li onClick={() => setOpen(false)}>
              <Link
                href={siteConfig.baseLinks.wedding}
                className="block rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Wedding
              </Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link
                href={siteConfig.baseLinks.classes}
                className="block rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Classes
              </Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link
                href={siteConfig.baseLinks.howToOrder}
                className="block rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                How to Order
              </Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link
                href={siteConfig.baseLinks.faq}
                className="block rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}