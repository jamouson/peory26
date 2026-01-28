"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, useEffect, FormEvent } from "react"
import Link from "next/link"
import { RiLoader2Fill, RiArrowLeftLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/AuthLayout"

import type { ResetStep } from "@/lib/auth-types"
import { getClerkErrorMessage } from "@/lib/auth-utils"

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<ResetStep>("email")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Pre-fill email from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  // Send reset code
  const handleSendCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return

      setIsLoading(true)
      setError("")
      setSuccessMessage("")

      try {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        })

        setSuccessMessage(`We sent a reset code to ${email}`)
        setStep("code")
      } catch (err) {
        setError(getClerkErrorMessage(err, "Failed to send reset code"))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signIn, email]
  )

  // Validate passwords
  const validatePasswords = useCallback((): string | null => {
    if (password !== confirmPassword) {
      return "Passwords do not match"
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    return null
  }, [password, confirmPassword])

  // Reset password
  const handleResetPassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      const validationError = validatePasswords()
      if (validationError) {
        setError(validationError)
        return
      }

      if (!isLoaded) return

      setIsLoading(true)
      setError("")

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code,
          password,
        })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          setSuccessMessage("Password reset successful!")
          
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        }
      } catch (err) {
        setError(
          getClerkErrorMessage(err, "Invalid code or failed to reset password")
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, signIn, setActive, code, password, validatePasswords, router]
  )

  // Back to email step
  const handleBackToEmail = useCallback(() => {
    setStep("email")
    setCode("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccessMessage("")
  }, [])

  return (
    <AuthLayout
      topRightButton={{ href: "/sign-in", label: "Sign in" }}
      sidebarContent={
        <blockquote className="space-y-2">
          <p className="text-lg">
            &ldquo;Forgot your password? No worries. We&apos;ll help you reset it in
            just a few steps.&rdquo;
          </p>
        </blockquote>
      }
    >
      {step === "email" ? (
        <>
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset code
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSendCode}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Reset Code
              </Button>

              <Link href="/sign-in">
                <Button variant="ghost" className="w-full">
                  <RiArrowLeftLine className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the code we sent to{" "}
              <strong className="font-medium text-foreground">{email}</strong>
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Reset Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  disabled={isLoading}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset Password
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={handleBackToEmail}
                disabled={isLoading}
              >
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Try a different email
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Footer */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}