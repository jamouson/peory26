"use client"

import { useSignIn } from "@clerk/nextjs"
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

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  // Form state
  const [identifier, setIdentifier] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")
  const [inputType, setInputType] = useState<"email" | "phone">("email")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Sign-in handler
  const handleSignIn = useCallback(
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

        const result = await signIn.create({
          identifier: formattedIdentifier,
        })

        // Check if we have any supported first factors
        if (!result.supportedFirstFactors || result.supportedFirstFactors.length === 0) {
          setError("Enter a valid email or phone number")
          setIsLoading(false)
          return
        }

        const codeFactor = result.supportedFirstFactors?.find(
          (factor) => factor.strategy === (detectedType === "email" ? "email_code" : "phone_code")
        )

        if (!codeFactor) {
          setError("Enter a valid email or phone number")
          setIsLoading(false)
          return
        }

        if (detectedType === "email" && "emailAddressId" in codeFactor) {
          await result.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: codeFactor.emailAddressId,
          })
          setVerifying(true)
        } else if (detectedType === "phone" && "phoneNumberId" in codeFactor) {
          await result.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: codeFactor.phoneNumberId,
          })
          setVerifying(true)
        } else {
          setError("Enter a valid email or phone number")
        }
      } catch (err: unknown) {
        // Clerk returns error code "form_identifier_not_found" when account doesn't exist
        setError("Enter a valid email or phone number")
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signIn, identifier]
  )

  // Verification handler
  const handleVerify = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return

      setIsLoading(true)
      setError("")

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: inputType === "email" ? "email_code" : "phone_code",
          code,
        })

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
    [isLoaded, signIn, setActive, inputType, code, router]
  )

  // OAuth handler
  const handleOAuth = useCallback(
    async (strategy: OAuthStrategy) => {
      if (!isLoaded) return

      try {
        await signIn.authenticateWithRedirect(getOAuthConfig(strategy))
      } catch (err) {
        setError(`Failed to sign in with ${strategy === "oauth_google" ? "Google" : "Instagram"}`)
      }
    },
    [isLoaded, signIn]
  )

  // Back from verification
  const handleBackFromVerify = useCallback(() => {
    setVerifying(false)
    setCode("")
    setError("")
  }, [])

  return (
    <AuthLayout
      topRightButton={{ href: "/sign-up", label: "Sign up" }}
      sidebarContent={<TestimonialCarousel />}
    >
      {!verifying ? (
        <>
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email or phone to receive a verification code
            </p>
          </div>

          {/* Form */}
          <div className="grid gap-6">
            <form onSubmit={handleSignIn}>
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
                  <div
                    className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                    role="alert"
                  >
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

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Sign up
              </Link>
            </p>
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
                <div
                  className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify & Sign In
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={handleBackFromVerify}
                disabled={isLoading}
              >
                Back to sign in
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  )
}