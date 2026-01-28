import { ClerkError } from "./auth-types"

/**
 * Extracts error message from Clerk error object
 */
export function getClerkErrorMessage(
  error: unknown,
  fallback = "An error occurred"
): string {
  const clerkError = error as ClerkError
  return clerkError.errors?.[0]?.message || fallback
}

/**
 * Generic error message for authentication failures
 * Prevents user enumeration attacks
 */
export const GENERIC_AUTH_ERROR = "Email or password is incorrect"

/**
 * OAuth strategy type
 */
export type OAuthStrategy = "oauth_google" | "oauth_instagram"

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  strategy: OAuthStrategy
  redirectUrl: string
  redirectUrlComplete: string
}

/**
 * Get OAuth config with defaults
 */
export function getOAuthConfig(strategy: OAuthStrategy): OAuthConfig {
  return {
    strategy,
    redirectUrl: "/sso-callback",
    redirectUrlComplete: "/dashboard",
  }
}