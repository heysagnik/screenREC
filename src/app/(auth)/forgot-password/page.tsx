"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
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
          className="group
            inline-flex items-center justify-center gap-2
            px-5 py-2
            bg-gradient-to-r from-[#6938EF] to-[#6938EF]/90
            hover:from-[#6938EF]/90 hover:to-[#6938EF]/80
            text-white font-medium text-sm
            rounded-full
            shadow-sm hover:shadow-md
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50 focus:ring-offset-2
            active:scale-[0.98]
            border border-[#6938EF]/10
            relative
            overflow-hidden
            before:absolute before:inset-0
            before:bg-gradient-to-b before:from-white/[0.00] before:to-white/[0.12]
            disabled:opacity-70 disabled:cursor-not-allowed
            w-full"
          disabled={isLoading}
        >
         
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending link...</span>
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-[#6938EF] hover:text-[#6938EF]/90">
          Log in
        </Link>
      </p>
    </div>
    </>
  )
}

