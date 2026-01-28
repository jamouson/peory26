"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useCallback, FormEvent } from "react"
import Link from "next/link"
import { RiLoader2Fill, RiGoogleFill, RiInstagramFill } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/PhoneInput"
import { TestimonialCarousel } from "@/components/TestimonialCarousel"
import { AuthLayout } from "@/components/AuthLayout"

import type { AuthMethod } from "@/lib/auth-types"
import {
  getClerkErrorMessage,
  getOAuthConfig,
  type OAuthStrategy,
} from "@/lib/auth-utils"

/**
 * Validate phone number has required digits
 */
function isPhoneComplete(phone: string): boolean {
  // Extract digits only
  const digits = phone.replace(/\D/g, "")
  
  // US/Canada needs 11 digits (+1 + 10 digits)
  // Most others need 12-13 digits
  return digits.length >= 11
}

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  // Form state
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Sign-up handler
  const handleSignUp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return

      setIsLoading(true)
      setError("")

      try {
        if (authMethod === "email") {
          await signUp.create({
            emailAddress: email,
            password,
          })
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          })
        } else {
          await signUp.create({
            phoneNumber: phone,
          })
          await signUp.preparePhoneNumberVerification()
        }

        setVerifying(true)
      } catch (err) {
        const errorMessage = getClerkErrorMessage(err)
        
        // Generic message for sensitive errors
        if (
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("identifier")
        ) {
          setError("Unable to create account. Please check your information.")
        } else {
          setError(errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signUp, authMethod, email, password, phone]
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
          authMethod === "email"
            ? await signUp.attemptEmailAddressVerification({ code })
            : await signUp.attemptPhoneNumberVerification({ code })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push("/dashboard")
        }
      } catch (err) {
        setError(getClerkErrorMessage(err, "Invalid verification code"))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signUp, setActive, authMethod, code, router]
  )

  // OAuth handler
  const handleOAuth = useCallback(
    async (strategy: OAuthStrategy) => {
      if (!isLoaded) return

      try {
        await signUp.authenticateWithRedirect(getOAuthConfig(strategy))
      } catch (err) {
        setError(getClerkErrorMessage(err, `Failed to sign up with ${strategy}`))
      }
    },
    [isLoaded, signUp]
  )

  // Auth method switcher
  const handleMethodSwitch = useCallback(() => {
    setAuthMethod((prev) => (prev === "email" ? "phone" : "email"))
    setError("")
  }, [])

  // Back from verification
  const handleBackFromVerify = useCallback(() => {
    setVerifying(false)
    setCode("")
    setError("")
  }, [])

  // Check if form is valid for submission
  const isFormValid =
    authMethod === "email"
      ? email.length > 0 && password.length > 0
      : isPhoneComplete(phone)

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
              Enter your email below to create your account
            </p>
          </div>

          {/* Form */}
          <div className="grid gap-6">
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                {/* Email/Phone Input */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identifier">
                      {authMethod === "email" ? "Email" : "Phone"}
                    </Label>
                    <button
                      type="button"
                      onClick={handleMethodSwitch}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {authMethod === "email" ? "Use phone" : "Use email"}
                    </button>
                  </div>
                  {authMethod === "email" ? (
                    <Input
                      id="identifier"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  ) : (
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      disabled={isLoading}
                      required
                    />
                  )}
                </div>

                {/* Password (Email only) */}
                {authMethod === "email" && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" disabled={isLoading || !isFormValid}>
                  {isLoading && (
                    <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {authMethod === "email"
                    ? "Sign Up with Email"
                    : "Continue with Phone"}
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
              Verify your {authMethod}
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to{" "}
              <strong className="font-medium text-foreground">
                {authMethod === "email" ? email : phone}
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