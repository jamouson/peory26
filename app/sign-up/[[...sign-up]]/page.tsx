"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useCallback, FormEvent } from "react"
import Link from "next/link"
import { RiLoader2Fill, RiGoogleFill, RiInstagramFill } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TestimonialCarousel } from "@/components/TestimonialCarousel"
import { AuthLayout } from "@/components/AuthLayout"

import {
  getOAuthConfig,
  type OAuthStrategy,
} from "@/lib/auth-utils"

/**
 * Detect if input is email or phone
 */
function detectInputType(input: string): "email" | "phone" {
  // Simple email detection (contains @)
  if (input.includes("@")) {
    return "email"
  }
  // Otherwise treat as phone
  return "phone"
}

/**
 * Format phone number for Clerk (add +1 prefix if needed)
 */
function formatPhoneForClerk(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  
  // Add +1 if not present
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  
  return `+${digits}`
}

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  // Form state
  const [identifier, setIdentifier] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")
  const [inputType, setInputType] = useState<"email" | "phone">("email")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Sign-up handler
  const handleSignUp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded || !identifier) return

      setIsLoading(true)
      setError("")

      const detectedType = detectInputType(identifier)
      setInputType(detectedType)

      try {
        const formattedIdentifier = detectedType === "phone" 
          ? formatPhoneForClerk(identifier)
          : identifier

        if (detectedType === "email") {
          await signUp.create({
            emailAddress: formattedIdentifier,
          })
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          })
        } else {
          await signUp.create({
            phoneNumber: formattedIdentifier,
          })
          await signUp.preparePhoneNumberVerification()
        }

        setVerifying(true)
      } catch (err: unknown) {
        // Check for specific Clerk error codes
        const clerkError = (err as { errors?: Array<{ code?: string }>, status?: number })?.errors?.[0]
        
        // Handle specific error cases
        if (
          clerkError?.code === "form_param_format_invalid" ||
          clerkError?.code === "form_identifier_exists" ||
          (err as { status?: number })?.status === 422
        ) {
          setError("Enter a valid email or phone number")
        } else {
          setError("Enter a valid email or phone number")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signUp, identifier]
  )

  // Verification handler
  const handleVerify = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return

      setIsLoading(true)
      setError("")

      try {
        const result =
          inputType === "email"
            ? await signUp.attemptEmailAddressVerification({ code })
            : await signUp.attemptPhoneNumberVerification({ code })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push("/dashboard")
        }
      } catch (err) {
        setError("Invalid verification code. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signUp, setActive, inputType, code, router]
  )

  // OAuth handler
  const handleOAuth = useCallback(
    async (strategy: OAuthStrategy) => {
      if (!isLoaded) return

      try {
        await signUp.authenticateWithRedirect(getOAuthConfig(strategy))
      } catch (err) {
        setError(`Failed to sign up with ${strategy === "oauth_google" ? "Google" : "Instagram"}`)
      }
    },
    [isLoaded, signUp]
  )

  // Back from verification
  const handleBackFromVerify = useCallback(() => {
    setVerifying(false)
    setCode("")
    setError("")
  }, [])

  return (
    <AuthLayout
      topRightButton={{ href: "/sign-in", label: "Login" }}
      sidebarContent={<TestimonialCarousel />}
    >
      {!verifying ? (
        <>
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email or phone to receive a verification code
            </p>
          </div>

          {/* Form */}
          <div className="grid gap-6">
            <form onSubmit={handleSignUp}>
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
                  Continue
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuth("oauth_google")}
              >
                <RiGoogleFill className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuth("oauth_instagram")}
              >
                <RiInstagramFill className="mr-2 h-4 w-4" />
                Instagram
              </Button>
            </div>
          </div>

          {/* Terms */}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
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
          {/* Verification Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your {inputType}
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to{" "}
              <strong className="font-medium text-foreground">
                {identifier}
              </strong>
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  disabled={isLoading}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify & Continue
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={handleBackFromVerify}
                disabled={isLoading}
              >
                Back to sign up
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  )
}