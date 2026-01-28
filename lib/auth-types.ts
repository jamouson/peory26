// Shared types for authentication pages

export interface ClerkError {
  errors?: Array<{
    message: string
    longMessage?: string
    code?: string
  }>
}

export type AuthMethod = "email" | "phone"

export type AuthStep = "input" | "verify"

export type ResetStep = "email" | "code"