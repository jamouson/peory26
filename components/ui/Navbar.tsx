// components/ui/Navbar.tsx
"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/use-scroll"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
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
  IconUser,
  IconLayoutDashboard,
  IconShoppingBag,
  IconLogout,
} from "@tabler/icons-react"

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

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => {
      setOpen(false)
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
        "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open === true ? "h-52" : "h-16",
        scrolled || open === true
          ? "border-gray-200/50 bg-white/80 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      <div className="w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Home">
            <span className="sr-only">Company logo</span>
            <DatabaseLogo className="w-28" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex md:items-center md:gap-x-6">
            <Link
              href={siteConfig.baseLinks.about}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              About
            </Link>
            <Link
              href={siteConfig.baseLinks.pricing}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Pricing
            </Link>
            <Link
              href={siteConfig.baseLinks.changelog}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Changelog
            </Link>
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-x-2 md:flex">
            <ModeToggle />
            <SignedIn>
              <CartIcon />
              <UserDropdown />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button>Sign in</Button>
              </Link>
            </SignedOut>
          </div>

          {/* Mobile right side */}
          <div className="flex gap-x-2 md:hidden">
            <ModeToggle />
            <SignedIn>
              <CartIcon />
              <UserDropdown />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button>Sign in</Button>
              </Link>
            </SignedOut>
            <Button
              onClick={() => setOpen(!open)}
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

        {/* Mobile nav links */}
        <nav
          className={cx(
            "my-6 flex text-lg ease-in-out will-change-transform md:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium">
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.about}>About</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.pricing}>Pricing</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.changelog}>Changelog</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}