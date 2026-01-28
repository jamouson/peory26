"use client"

import { useSignUp } from "@clerk/nextjs"
import { useState, useCallback, FormEvent } from "react"
import Link from "next/link"
import { RiLoader2Fill, RiCheckLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TestimonialCarousel } from "@/components/TestimonialCarousel"
import { AuthLayout } from "@/components/AuthLayout"

/**
 * Detect if input is email or phone
 */
function detectInputType(input: string): "email" | "phone" {
  if (input.includes("@")) {
    return "email"
  }
  return "phone"
}

/**
 * Format phone number for Clerk (add +1 prefix if needed)
 */
function formatPhoneForClerk(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  
  return `+${digits}`
}

export default function WaitlistPage() {
  const { isLoaded, signUp } = useSignUp()

  // Form state
  const [identifier, setIdentifier] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Waitlist signup handler
  const handleWaitlistSignup = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded || !identifier) return

      setIsLoading(true)
      setError("")

      const detectedType = detectInputType(identifier)

      try {
        const formattedIdentifier = detectedType === "phone" 
          ? formatPhoneForClerk(identifier)
          : identifier

        if (detectedType === "email") {
          await signUp.create({
            emailAddress: formattedIdentifier,
          })
        } else {
          await signUp.create({
            phoneNumber: formattedIdentifier,
          })
        }

        // Successfully added to waitlist
        setSubmitted(true)
      } catch (err: unknown) {
        // Handle specific errors
        const clerkError = (err as { errors?: Array<{ code?: string }> })?.errors?.[0]
        
        if (clerkError?.code === "form_identifier_exists") {
          setError("You're already on the waitlist")
        } else {
          setError("Enter a valid email or phone number")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signUp, identifier]
  )

  return (
    <AuthLayout
      topRightButton={{ href: "/sign-in", label: "Sign in" }}
      sidebarContent={<TestimonialCarousel />}
    >
      {!submitted ? (
        <>
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Join the waitlist
            </h1>
            <p className="text-sm text-muted-foreground">
              Be among the first to experience our platform
            </p>
          </div>

          {/* Form */}
          <div className="grid gap-6">
            <form onSubmit={handleWaitlistSignup}>
              {/* Clerk CAPTCHA */}
              <div id="clerk-captcha" />
              
              <div className="grid gap-4">
                {/* Email or Phone Input */}
                <div className="grid gap-2">
                  <Label htmlFor="identifier">Email or Phone</Label>
                  <Input
                    id="identifier"
                    placeholder="name@example.com or (555) 123-4567"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" disabled={isLoading || !identifier}>
                  {isLoading && (
                    <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Join Waitlist
                </Button>
              </div>
            </form>

            {/* Already have access */}
            <div className="text-center text-sm text-muted-foreground">
              Already have access?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Terms */}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By joining the waitlist, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          {/* Success State */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {/* Success Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <RiCheckLine className="h-8 w-8 text-primary" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                You&apos;re on the list!
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We&apos;ve added{" "}
                <strong className="font-medium text-foreground">
                  {identifier}
                </strong>{" "}
                to our waitlist. We&apos;ll notify you when it&apos;s your turn to join.
              </p>
            </div>

            {/* Additional Info */}
            <div className="pt-4 space-y-3 w-full">
              <div className="rounded-lg border bg-muted/50 p-4 text-left">
                <h3 className="font-medium text-sm mb-1">What&apos;s next?</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;re onboarding users gradually to ensure the best experience. 
                  You&apos;ll receive an email when you&apos;re approved to create your account.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false)
                  setIdentifier("")
                }}
              >
                Join with different email
              </Button>

              <Link href="/" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full"
                >
                  Go back home
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  )
}