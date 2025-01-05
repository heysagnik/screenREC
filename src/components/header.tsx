"use client"

import { Input } from "@/components/ui/input"
import { Search, Settings, LogOut, Library } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from 'react'
import { CommandMenu } from "./command-menu"
import Image from "next/image"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu"
import ZapdButton from "./zapd-button"

export function Header() {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <header className="bg-gradient-to-b from-white to-gray-50/90 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
          <Link href="/zaps" className="flex-shrink-0">
            <Image src="/logo.svg" alt="ScreenREC" width={100} height={28} className="h-6 sm:h-7 w-auto" />
          </Link>

          {/* Centered Search Bar */}
          <div className="hidden sm:block flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                onClick={() => setOpen(true)}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-9 pr-12 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm transition-all duration-200 group-hover:border-[#6938EF]/20 group-hover:shadow-md focus:ring-2 focus:ring-[#6938EF]/20 cursor-pointer" 
                placeholder="Search recordings or type a command..."
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex px-2 py-0.5 text-xs rounded bg-gray-100/80 text-gray-500 border border-gray-200/50 shadow-sm">
                ⌘/
              </kbd>
            </div>
            
            <CommandMenu 
              open={open} 
              onOpenChange={setOpen}
              search={inputValue}
              onSearchChange={setInputValue}
            />
          </div>
        </div>
          
          {/* Mobile Search Bar */} 
          <button 
            onClick={() => setOpen(true)}
            className="md:hidden p-2 hover:bg-gray-50 rounded-full"
          >
            <Search className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
                <ZapdButton text="Capture a new Zap" />
              </div>
              <div className="sm:hidden">
                <ZapdButton text="Capture" />
              </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 ring-2 ring-white ring-offset-2 cursor-pointer hover:ring-gray-100 transition-all duration-200">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium text-xs sm:text-sm">AS</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-64 p-2 mt-4">
                  <div className="flex items-center gap-3 p-2.5">
                    <Avatar className="h-10 w-10 ring-2 ring-white">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-gradient-to-br from-[#6938EF]/20 to-[#6938EF]/30 text-[#6938EF]">AS</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Alex Smith</span>
                      <span className="text-xs text-gray-500">alex@company.com</span>
                    </div>
                  </div>
                
                  <DropdownMenuSeparator className="my-1.5" />
                  
                  <div className="space-y-0.5">
                    <DropdownMenuItem asChild>
                      <Link href="/zaps" className="flex items-center gap-2.5 p-2.5 text-sm rounded-lg group">
                        <div className=" rounded-lg bg-gray-50 group-hover:bg-[#6938EF]/10">
                          <Library className="h-4 w-4 text-gray-600 group-hover:text-[#6938EF]" />
                        </div>
                        <span className="font-medium">My Library</span>
                      </Link>
                    </DropdownMenuItem>
                
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2.5 p-2.5 text-sm rounded-lg group">
                      <div className=" rounded-lg bg-gray-50 group-hover:bg-[#6938EF]/10">
                        <Settings className="h-4 w-4 text-gray-600 group-hover:text-[#6938EF]" />
                      </div>
                      <span className="font-medium">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                
                  <DropdownMenuSeparator className="my-1.5" />
                  
                  <DropdownMenuItem className="flex items-center gap-2.5 p-2.5 text-sm rounded-lg group text-red-600">
                    <div className="rounded-lg bg-red-50 group-hover:bg-red-100">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* <CommandMenu 
            open={open} 
            onOpenChange={setOpen} 
          /> */}
    </header>
  )
}