"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

/**
 * Format phone number for US: (555) 123-4567
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  required = false,
}: PhoneInputProps) {
  // Parse initial value
  const getInitialPhone = () => {
    if (!value) return ""
    // Remove +1 prefix if present
    return value.replace(/^\+1\s*/, "")
  }

  const [phoneNumber, setPhoneNumber] = useState(getInitialPhone)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Only allow digits, spaces, parentheses, and hyphens
    const filtered = input.replace(/[^\d\s()-]/g, "")

    // Extract digits only
    const digits = filtered.replace(/\D/g, "")

    // Limit to 10 digits for US
    if (digits.length > 10) return

    // Format and set
    const formatted = formatPhoneNumber(digits)
    setPhoneNumber(formatted)
    
    // Update parent with full number including country code
    const fullNumber = digits ? `+1 ${digits}` : ""
    onChange(fullNumber)
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        {/* US Flag and Code */}
        <div className="absolute left-3 z-10 flex items-center gap-1.5 pointer-events-none">
          <span>🇺🇸</span>
          <span className="text-sm font-medium text-muted-foreground">+1</span>
        </div>

        {/* Phone Number Input */}
        <Input
          type="tel"
          placeholder="(555) 123-4567"
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={disabled}
          required={required}
          className="pl-[70px]"
          inputMode="numeric"
        />
      </div>
    </div>
  )
}