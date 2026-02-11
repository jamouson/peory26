import * as React from "react"
import Image from "next/image"

interface DatabaseLogoProps {
  className?: string
  width?: number
}

export const DatabaseLogo = ({ className, width = 250 }: DatabaseLogoProps) => {
  // Original image aspect ratio is ~3.04:1 (1653x543)
  const height = Math.round(width / 3.04)

  return (
    <>
      {/* Light mode: original orange logo */}
      <Image
        src="/logo.webp"
        alt="Peory Cake"
        width={width}
        height={height}
        className={`dark:hidden ${className ?? ""}`}
        priority
      />
      {/* Dark mode: white logo */}
      <Image
        src="/logo-wt.webp"
        alt="Peory Cake"
        width={width}
        height={height}
        className={`hidden dark:block ${className ?? ""}`}
        priority
      />
    </>
  )
}