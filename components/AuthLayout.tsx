import { ReactNode } from "react"
import { Link as TransitionLink } from "next-view-transitions"
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
      {/* ─── Mobile header bar — matches Navbar positioning exactly ─── */}
      {/* Navbar uses: inset-x-3 top-4 px-3 py-3 with flex items-center justify-between */}
      <div className="absolute inset-x-3 top-4 z-20 flex items-center justify-between px-3 py-3 lg:hidden">
        {showLogo && (
          <TransitionLink href="/" aria-label="Home">
            <div style={{ viewTransitionName: "peory-logo" }}>
              <DatabaseLogo className="h-10 w-auto" />
            </div>
          </TransitionLink>
        )}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <TransitionLink href={topRightButton.href}>
            <Button variant="ghost">{topRightButton.label}</Button>
          </TransitionLink>
        </div>
      </div>

      {/* ─── Desktop right actions (positioned in form column) ─── */}
      <div className="absolute right-4 top-4 z-20 hidden h-10 items-center gap-2 lg:flex lg:right-8 lg:top-8">
        <ModeToggle />
        <TransitionLink href={topRightButton.href}>
          <Button variant="ghost">{topRightButton.label}</Button>
        </TransitionLink>
      </div>

      {/* Sidebar */}
      {sidebarContent && (
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <TransitionLink href="/" aria-label="Home">
              <div style={{ viewTransitionName: "peory-logo" }}>
                <DatabaseLogo className="w-44" />
              </div>
            </TransitionLink>
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