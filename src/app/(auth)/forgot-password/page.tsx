"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    // Add your password reset logic here
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <>
    <div className="absolute inset-0 top-0 h-[400px] -z-10">
        <div 
            className="absolute inset-0"
            style={{
                backgroundImage: `
                linear-gradient(to bottom, transparent 0%, rgb(255 255 255) 100%),
                linear-gradient(to right, rgb(209 213 219 / 0.9) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(209 213 219 / 0.9) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 24px 24px, 24px 24px'
            }}
            />
      </div>
    
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot password
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#5848BC] hover:bg-[#5848BC]/90"
          disabled={isLoading}
        >
          {isLoading ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-[#5848BC] hover:text-[#5848BC]/90">
          Log in
        </Link>
      </p>
    </div>
    </>
  )
}

