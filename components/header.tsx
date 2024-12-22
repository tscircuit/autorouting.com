"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import {
  Code,
  Database,
  LogOut,
  Route,
  Upload,
  UploadCloud,
} from "lucide-react"
import ardot from "/images/ardot.svg"
import Image from "next/image.js"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Button } from "./ui/button"
import { useSignOut } from "@/hooks/use-sign-out"

export function Header() {
  const pathname = usePathname()
  const isLoggedIn = useGlobalStore((s) => !!s.session)
  const { signOut } = useSignOut()

  return (
    <header className="border-b">
      <div className="container flex h-16 px-4 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Image alt="autorouting text logo" src={ardot} className="w-8" />
          <span className="text-md">autorouting</span>
        </Link>
        <div className="flex-1" />
        <nav className="ml-8 flex items-center space-x-6">
          <Link
            href="https://blog.autorouting.com"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground",
            )}
          >
            Blog
          </Link>
          <Link
            href="/datasets"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/datasets"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Database className="w-4 h-4 mr-1 text-gray-500" />
            Datasets
          </Link>
          <Link
            href="/autorouters"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/autorouters"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Route className="w-4 h-4 mr-1 text-gray-500" />
            Autorouters
          </Link>
          <Link
            href="/contribute"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/contribute"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <UploadCloud className="w-4 h-4 mr-1 text-gray-500" />
            Contribute
          </Link>
          <Link
            href="https://blog.autorouting.com/p/why-were-building-autoroutingcom"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/about" ? "text-primary" : "text-muted-foreground",
            )}
          >
            About
          </Link>
          {isLoggedIn && (
            <Button
              className="mx-0 px-1"
              variant="ghost"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
