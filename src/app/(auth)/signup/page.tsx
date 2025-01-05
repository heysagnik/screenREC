"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Check, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")

  const hasEightChars = password.length >= 8
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    // Add your signup logic here
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
          Create an account
        </h1>
        <p className="text-muted-foreground">
          A step towards capturing the <b>Zap</b> moments of your screen.
        </p>
      </div>

      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup" className="w-full">
                Sign up
            </TabsTrigger>
            <Link href="/login">
            <TabsTrigger value="login" className="w-full">
            Log in
            </TabsTrigger>
            </Link>
        </TabsList>
        </Tabs>
      

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className={`h-4 w-4 ${hasEightChars ? 'text-green-500' : 'text-gray-300'}`} />
              Must be at least 8 characters
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className={`h-4 w-4 ${hasSpecialChar ? 'text-green-500' : 'text-gray-300'}`} />
              Must contain one special character
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="
            group
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
          disabled={isLoading || !hasEightChars || !hasSpecialChar}
        >
          {isLoading ?  (
            <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating Account ...</span>
            </>
          ) : (
            "Get started"
            )}
        </Button>

        <Button
          type="button"
          className="
            w-full
            inline-flex items-center justify-center gap-3
            px-5 py-2.5
            bg-white hover:bg-gray-50/80
            text-gray-700 font-medium text-sm
            rounded-full
            shadow-sm hover:shadow-md
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
            active:scale-[0.98]
            border border-gray-200
            relative
            group
          "
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="transition-transform group-hover:scale-110"
          />
          <span>Sign in with Google</span>
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-[#5848BC] hover:text-[#5848BC]/90">
          Log in
        </Link>
      </p>
    </div>
    </>
  )
}

