"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    // Add your login logic here
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
          Log in to your account
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Please enter your details.
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <Link href="/signup">
            <TabsTrigger value="signup" className="w-full">
                Sign up
            </TabsTrigger>
            </Link>
            <TabsTrigger value="login" className="w-full">
            Log in
            </TabsTrigger>
        </TabsList>
        </Tabs>

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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember for 30 days
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-[#5848BC] hover:text-[#5848BC]/90"
          >
            Forgot password
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#5848BC] hover:bg-[#5848BC]/90"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#5848BC] hover:text-[#5848BC]/90">
          Sign up
        </Link>
      </p>
    </div>
    </>
  )
}

