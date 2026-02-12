import * as React from "react"
import Image from "next/image"

interface DatabaseLogoProps {
  className?: string
  width?: number
}

export const DatabaseLogo = ({ className, width = 250 }: DatabaseLogoProps) => {
  // Logo aspect ratio is ~2.52:1 (702x279)
  const height = Math.round(width / 2.52)

  return (
    <>
      {/* Light mode */}
      <Image
        src="/logo-default.webp"
        alt="Peory L'atelier Cake"
        width={width}
        height={height}
        className={`dark:hidden object-contain ${className ?? ""}`}
        priority
      />
      {/* Dark mode */}
      <Image
        src="/logo-white.webp"
        alt="Peory L'atelier Cake"
        width={width}
        height={height}
        className={`hidden dark:block object-contain ${className ?? ""}`}
        priority
      />
    </>
  )
}