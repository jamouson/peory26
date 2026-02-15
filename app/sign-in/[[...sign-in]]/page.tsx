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
import { getOAuthConfig, type OAuthStrategy } from "@/lib/auth-utils"

// --- HELPER FUNCTIONS (Consider moving these to @/lib/auth-utils.ts) ---

function detectInputType(input: string): "email" | "phone" {
  return input.includes("@") ? "email" : "phone"
}

function formatPhoneForClerk(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

function getClerkErrorMessage(error: any): string {
  const code = error?.errors?.[0]?.code
  if (code === "form_identifier_not_found") return "No account found with this email or phone."
  if (code === "form_password_incorrect") return "Incorrect password."
  if (code === "verification_code_invalid") return "Invalid verification code."
  if (code === "too_many_attempts") return "Too many attempts. Please try again later."
  return error?.errors?.[0]?.message || "An error occurred. Please try again."
}

// -----------------------------------------------------------------------

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  // State
  const [identifier, setIdentifier] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")
  const [inputType, setInputType] = useState<"email" | "phone">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Handlers
  const handleSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !identifier) return

    setIsLoading(true)
    setError("")

    const type = detectInputType(identifier)
    setInputType(type)

    try {
      const formattedIdentifier = type === "phone" 
        ? formatPhoneForClerk(identifier) 
        : identifier

      const result = await signIn.create({ identifier: formattedIdentifier })

      // Identify the correct verification strategy based on user input
      const strategyToUse = type === "email" ? "email_code" : "phone_code"
      
      const codeFactor = result.supportedFirstFactors?.find(
        (factor) => factor.strategy === strategyToUse
      )

      if (!codeFactor) {
        throw new Error("Authentication factor not supported.")
      }

      // Prepare the verification (send the code)
      const prepareParams = type === "email" 
        ? { strategy: "email_code", emailAddressId: (codeFactor as any).emailAddressId }
        : { strategy: "phone_code", phoneNumberId: (codeFactor as any).phoneNumberId }

      await result.prepareFirstFactor(prepareParams as any)
      setVerifying(true)

    } catch (err: any) {
      setError(getClerkErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, identifier])

  const handleVerify = useCallback(async (e: FormEvent) => {
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
      } else {
        setError("Verification incomplete. Please contact support.")
      }
    } catch (err: any) {
      setError(getClerkErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, setActive, inputType, code, router])

  const handleOAuth = useCallback(async (strategy: OAuthStrategy) => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect(getOAuthConfig(strategy))
    } catch (err) {
      setError(`Failed to connect with ${strategy === "oauth_google" ? "Google" : "Instagram"}`)
    }
  }, [isLoaded, signIn])

  return (
    <AuthLayout
      topRightButton={{ href: "/sign-up", label: "Sign up" }}
      sidebarContent={<TestimonialCarousel />}
    >
      {!verifying ? (
        <>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email or phone to receive a verification code
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4">
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
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading || !identifier}>
                  {isLoading && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuth("oauth_google")}>
                <RiGoogleFill className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuth("oauth_instagram")}>
                <RiInstagramFill className="mr-2 h-4 w-4" /> Instagram
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Verify your {inputType}</h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to <strong className="font-medium text-foreground">{identifier}</strong>
            </p>
          </div>

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
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>
              <Button variant="ghost" type="button" onClick={() => { setVerifying(false); setError(""); }} disabled={isLoading}>
                Back to sign in
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  )
}