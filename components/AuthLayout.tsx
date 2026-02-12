import { ReactNode } from "react"
import Link from "next/link"
import { DatabaseLogo } from "@/components/icons/DatabaseLogo"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface AuthLayoutProps {
  children: ReactNode
  showLogo?: boolean
  sidebarContent?: ReactNode
  topRightButton: {
    href: string
    label: string
  }
}

export function AuthLayout({
  children,
  showLogo = true,
  sidebarContent,
  topRightButton,
}: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-screen flex-col items-center justify-center lg:grid-cols-2">
      {/* Mobile Logo */}
      {showLogo && (
        <div className="absolute left-4 top-4 z-20 flex items-center md:left-8 md:top-8 lg:hidden">
          <Link href="/" aria-label="Home">
            <DatabaseLogo className="h-16 w-auto" />
          </Link>
        </div>
      )}

      {/* Top Right Actions */}
      <div className="absolute right-4 top-4 z-20 flex h-10 items-center gap-2 md:right-8 md:top-8">
        <ModeToggle />
        <Link href={topRightButton.href}>
          <Button variant="ghost">{topRightButton.label}</Button>
        </Link>
      </div>

      {/* Sidebar */}
      {sidebarContent && (
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" aria-label="Home">
              <DatabaseLogo className="h-16 w-auto" />
            </Link>
          </div>
          <div className="relative z-20 mt-auto">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-full items-center px-4 py-12 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
}